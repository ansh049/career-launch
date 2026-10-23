import { authenticate } from "./authenticate.js";

export const requireAuth = authenticate;

export function allowRoles(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to perform this action",
      });
    }

    if (req.user.role === "recruiter" && !req.user.recruiterVerified) {
      return res.status(403).json({
        success: false,
        message: "Recruiter verification is pending",
      });
    }

    next();
  };
}
