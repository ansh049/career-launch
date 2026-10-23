import { Router } from "express";
import { requireAuth, allowRoles } from "../middleware/auth.middleware.js";
import {
  reportJob,
  getJobRiskSummary,
  listFlaggedJobs,
  reviewFlaggedJob,
} from "../controllers/moderation.controller.js";

const router = Router();

// ─── Public / candidate: report a suspicious job ───────────────────────────
// POST /api/jobs/:jobId/report  (called from JobDetailsPage)
router.post("/jobs/:jobId/report", requireAuth, reportJob);

// GET /api/jobs/:jobId/risk-summary  (safe fields only — available to all authenticated users)
router.get("/jobs/:jobId/risk-summary", requireAuth, getJobRiskSummary);

// ─── Admin: moderation queue ────────────────────────────────────────────────
// GET /api/moderation/jobs/flagged
router.get(
  "/moderation/jobs/flagged",
  requireAuth,
  allowRoles("admin"),
  listFlaggedJobs
);

// POST /api/moderation/jobs/:jobId/review
router.post(
  "/moderation/jobs/:jobId/review",
  requireAuth,
  allowRoles("admin"),
  reviewFlaggedJob
);

export default router;
