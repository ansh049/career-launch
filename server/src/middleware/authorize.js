export function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to access this resource",
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
