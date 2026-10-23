import { Router } from "express";
import bcrypt from "bcrypt";
import { z } from "zod";
import User from "../models/User.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { createCsrfToken } from "../middleware/csrf.middleware.js";
import { createToken, cookieOptions } from "../utils/token.js";

const router = Router();

const registerSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email().max(254),
  password: z.string().min(10).max(72),
  role: z.enum(["candidate", "recruiter"]).default("candidate"),
});

const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1).max(72),
});

function publicUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    recruiterVerified: user.recruiterVerified,
    headline: user.headline,
    skills: user.skills,
    resumeUrl: user.resumeUrl,
  };
}
router.get("/csrf", (req, res) => {
  const csrfToken = createCsrfToken();
  res.cookie("csrfToken", csrfToken, {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });
  res.json({ success: true, csrfToken });
});

router.post("/register", async (req, res, next) => {
  try {
    const parsed = registerSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid registration data",
        errors: parsed.error.flatten(),
      });
    }

    const { name, email, password, role } = parsed.data;
    const normalizedEmail = email.toLowerCase();

    const existing = await User.findOne({ email: normalizedEmail });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists",
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await User.create({
      name,
      email: normalizedEmail,
      passwordHash,
      role,
    });

    res.cookie("accessToken", createToken(user._id), cookieOptions);

    return res.status(201).json({
      success: true,
      user: publicUser(user),
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists",
      });
    }

    next(error);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const parsed = loginSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid login data",
      });
    }

    const email = parsed.data.email.toLowerCase();

    const user = await User.findOne({ email }).select("+passwordHash");

    if (
      !user ||
      !(await bcrypt.compare(parsed.data.password, user.passwordHash))
    ) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    res.cookie("accessToken", createToken(user._id), cookieOptions);

    res.json({
      success: true,
      user: publicUser(user),
    });
  } catch (error) {
    next(error);
  }
});

router.post("/logout", (req, res) => {
  res.clearCookie("accessToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });
  res.clearCookie("csrfToken", {
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });

  res.json({ success: true, message: "Logged out successfully" });
});

router.get("/me", requireAuth, (req, res) => {
  res.json({
    success: true,
    user: publicUser(req.user),
  });
});

router.patch("/me", requireAuth, async (req, res, next) => {
  try {
    const schema = z
      .object({
        name: z.string().trim().min(2).max(80).optional(),
        headline: z.string().trim().max(160).optional(),
        skills: z.array(z.string().trim().min(1).max(60)).max(50).optional(),
      })
      .strict();

    const parsed = schema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid profile data",
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: parsed.data },
      { new: true, runValidators: true },
    );

    res.json({ success: true, user: publicUser(user) });
  } catch (error) {
    next(error);
  }
});

export default router;
