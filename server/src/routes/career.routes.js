import { Router } from "express";
import { requireAuth, allowRoles } from "../middleware/auth.middleware.js";
import {
  handleGapAnalysis,
  handleCreateRoadmap,
  handleGetRoadmaps,
  handleGetRoadmapById,
  handleUpdateMilestone,
} from "../controllers/career.controller.js";

const router = Router();

// Protect all career routes for candidate role
router.use(requireAuth);

router.post("/gap-analysis", allowRoles("candidate"), handleGapAnalysis);
router.post("/roadmaps", allowRoles("candidate"), handleCreateRoadmap);
router.get("/roadmaps", allowRoles("candidate"), handleGetRoadmaps);
router.get("/roadmaps/:id", allowRoles("candidate"), handleGetRoadmapById);
router.patch("/roadmaps/:id/milestones/:milestoneId", allowRoles("candidate"), handleUpdateMilestone);

export default router;
