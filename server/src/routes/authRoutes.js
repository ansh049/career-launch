import { Router } from "express";

import {
  register,
  login,
  refresh,
  logout,
  getMe,
} from "../controllers/authController.js";

import { authenticate } from "../middleware/authenticate.js";
import { trustedOrigin } from "../middleware/trustedOrigin.js";
import { createCsrfToken } from "../middleware/csrf.middleware.js";

const router = Router();

router.get("/csrf", (req, res) => {
  const csrfToken = createCsrfToken();
  const isProduction = process.env.NODE_ENV === "production";
  res.cookie("csrfToken", csrfToken, {
    httpOnly: false,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    path: "/",
  });
  res.json({ success: true, csrfToken });
});

router.post("/register", trustedOrigin, register);
router.post("/login", trustedOrigin, login);
router.post("/refresh", trustedOrigin, refresh);
router.post("/logout", trustedOrigin, logout);
router.get("/me", authenticate, getMe);

export default router;
