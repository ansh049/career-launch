import bcrypt from "bcrypt";
import User from "../models/User.js";
import {
  createAccessToken,
  createRefreshToken,
  verifyRefreshToken,
  hashToken,
  tokenHashesMatch,
} from "../utils/token.js";
import {
  REFRESH_COOKIE,
  setAuthCookies,
  clearAuthCookies,
} from "../utils/cookies.js";
import { registerSchema, loginSchema } from "../validators/authSchemas.js";

function publicUser(user) {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    recruiterVerified: user.recruiterVerified,
    headline: user.headline || "",
    phone: user.phone || "",
    location: user.location || "",
    bio: user.bio || "",
    links: user.links || {},
    skills: user.skills || [],
    education: user.education || [],
    experience: user.experience || [],
    resumeUrl: user.resumeUrl || "",
    profileCompleted: Boolean(user.profileCompleted),
    createdAt: user.createdAt,
  };
}

function validationErrorMessage(error) {
  return (
    error.issues?.map((issue) => issue.message).join(", ") || "Invalid input"
  );
}

// POST /api/auth/register
export async function register(req, res, next) {
  try {
    const parsed = registerSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: validationErrorMessage(parsed.error),
      });
    }

    const { name, email, password, role = "candidate" } = parsed.data;
    const normalizedEmail = email.toLowerCase();

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
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
      ...(role === "recruiter" && process.env.NODE_ENV === "development"
        ? { recruiterVerified: true }
        : {}),
    });

    const refreshToken = createRefreshToken(user);
    user.refreshTokenHash = hashToken(refreshToken);
    await user.save();
    setAuthCookies(res, createAccessToken(user), refreshToken);

    return res.status(201).json({
      success: true,
      message: "Account created successfully",
      user: publicUser(user),
      authenticated: true,
    });
  } catch (error) {
    next(error);
  }
}

// POST /api/auth/login
export async function login(req, res, next) {
  try {
    const parsed = loginSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: validationErrorMessage(parsed.error),
      });
    }

    const { email, password } = parsed.data;

    const user = await User.findOne({
      email: email.toLowerCase(),
    }).select("+passwordHash +refreshTokenHash");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const passwordMatches = await bcrypt.compare(password, user.passwordHash);

    if (!passwordMatches) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    if (
      user.role === "recruiter" &&
      process.env.NODE_ENV === "development" &&
      !user.recruiterVerified
    ) {
      user.recruiterVerified = true;
    }

    const refreshToken = createRefreshToken(user);
    user.refreshTokenHash = hashToken(refreshToken);
    await user.save();

    setAuthCookies(res, createAccessToken(user), refreshToken);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      user: publicUser(user),
    });
  } catch (error) {
    next(error);
  }
}

// POST /api/auth/refresh
export async function refresh(req, res, next) {
  try {
    const refreshToken = req.cookies?.[REFRESH_COOKIE];

    if (!refreshToken) {
      clearAuthCookies(res);

      return res.status(401).json({
        success: false,
        message: "Refresh token missing. Please sign in again.",
      });
    }

    let payload;

    try {
      payload = verifyRefreshToken(refreshToken);
    } catch {
      clearAuthCookies(res);

      return res.status(401).json({
        success: false,
        message: "Refresh token expired or invalid. Please sign in again.",
      });
    }

    if (payload.type !== "refresh" || !payload.sub) {
      clearAuthCookies(res);

      return res.status(401).json({
        success: false,
        message: "Invalid refresh token",
      });
    }

    const user = await User.findById(payload.sub).select("+refreshTokenHash");

    if (
      !user ||
      !tokenHashesMatch(user.refreshTokenHash, hashToken(refreshToken))
    ) {
      // A missing or previously rotated token cannot create a session.
      if (user) {
        user.refreshTokenHash = null;
        await user.save();
      }

      clearAuthCookies(res);

      return res.status(401).json({
        success: false,
        message: "Session is no longer valid. Please sign in again.",
      });
    }

    // Rotate the refresh token on every successful refresh.
    const newRefreshToken = createRefreshToken(user);
    user.refreshTokenHash = hashToken(newRefreshToken);
    await user.save();

    setAuthCookies(res, createAccessToken(user), newRefreshToken);

    return res.status(200).json({
      success: true,
      user: publicUser(user),
    });
  } catch (error) {
    next(error);
  }
}

// POST /api/auth/logout
export async function logout(req, res, next) {
  try {
    const refreshToken = req.cookies?.[REFRESH_COOKIE];

    if (refreshToken) {
      try {
        const payload = verifyRefreshToken(refreshToken);

        if (payload.type === "refresh" && payload.sub) {
          const user = await User.findById(payload.sub).select(
            "+refreshTokenHash",
          );

          if (
            user &&
            tokenHashesMatch(user.refreshTokenHash, hashToken(refreshToken))
          ) {
            user.refreshTokenHash = null;
            await user.save();
          }
        }
      } catch {
        // Clear the browser cookies even if the token is expired.
      }
    }

    clearAuthCookies(res);

    return res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    next(error);
  }
}

// GET /api/auth/me
export async function getMe(req, res) {
  return res.status(200).json({
    success: true,
    user: publicUser(req.user),
  });
}
