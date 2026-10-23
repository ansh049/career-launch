import { isAllowedClientOrigin } from "../config/clientOrigins.js";

export function trustedOrigin(req, res, next) {
  const origin = req.get("origin");

  // Requests without Origin can be made by server clients such as curl.
  // Browser requests with an Origin must match an allowed frontend.
  if (origin && !isAllowedClientOrigin(origin)) {
    return res.status(403).json({
      success: false,
      message: "Untrusted request origin",
    });
  }

  next();
}