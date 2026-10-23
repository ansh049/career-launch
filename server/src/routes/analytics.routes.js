import { Router } from "express";
import { requireAuth, allowRoles } from "../middleware/auth.middleware.js";
import {
  candidateAnalytics,
  recruiterAnalytics,
  marketAnalytics,
} from "../controllers/analytics.controller.js";

const router = Router();

// GET /api/analytics/candidate — scoped to authenticated candidate
router.get("/candidate", requireAuth, allowRoles("candidate"), candidateAnalytics);

// GET /api/analytics/recruiter — scoped to authenticated recruiter
router.get("/recruiter", requireAuth, allowRoles("recruiter"), recruiterAnalytics);

// GET /api/analytics/market — available to all authenticated users
router.get("/market", requireAuth, marketAnalytics);

export default router;
