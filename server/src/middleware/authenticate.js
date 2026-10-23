import User from "../models/User.js";
import { ACCESS_COOKIE } from "../utils/cookies.js";
import { verifyAccessToken } from "../utils/token.js";

export async function authenticate(req, res, next) {
  try {
    const authHeader = req.get("authorization");
    const bearerToken = authHeader?.startsWith("Bearer ")
      ? authHeader.slice(7)
      : null;
    const token = bearerToken || req.cookies?.[ACCESS_COOKIE];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const payload = verifyAccessToken(token);

    if (payload.type !== "access" || !payload.sub) {
      return res.status(401).json({
        success: false,
        message: "Invalid access token",
      });
    }

    const user = await User.findById(payload.sub);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User account no longer exists",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (
      error.name === "TokenExpiredError" ||
      error.name === "JsonWebTokenError"
    ) {
      return res.status(401).json({
        success: false,
        message: "Session expired or invalid. Please sign in again.",
      });
    }

    next(error);
  }
}
