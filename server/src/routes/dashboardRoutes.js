import { Router } from "express";
import { requireAuth, allowRoles } from "../middleware/auth.middleware.js";

const router = Router();

router.get(
  "/candidate/dashboard",
  requireAuth,
  allowRoles("candidate"),
  (req, res) => {
    res.json({
      success: true,
      message: "Candidate dashboard access granted",
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
      },
      stats: {
        applications: 0,
        interviews: 0,
        savedJobs: 0,
      },
    });
  },
);

router.get(
  "/recruiter/dashboard",
  requireAuth,
  allowRoles("recruiter"),
  (req, res) => {
    res.json({
      success: true,
      message: "Recruiter dashboard access granted",
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
      },
      stats: {
        activeJobs: 0,
        applicants: 0,
        interviews: 0,
      },
    });
  },
);

export default router;
