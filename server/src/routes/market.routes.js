import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import { getMarketAnalytics } from "../services/analytics.service.js";
import Skill from "../models/Skill.js";
import { getRelatedSkills } from "../services/skillGraph.service.js";

const router = Router();

// GET /api/market/skills — top skills across all published jobs
router.get("/skills", async (req, res, next) => {
  try {
    const { role, limit = 20 } = req.query;
    const data = await getMarketAnalytics({ role, limit: Math.min(parseInt(limit) || 20, 50) });
    res.json({ success: true, skills: data.topSkills, meta: { totalJobsAnalyzed: data.totalJobsAnalyzed, dataNote: data.dataNote } });
  } catch (error) {
    next(error);
  }
});

// GET /api/market/roles — job type and experience level breakdown
router.get("/roles", async (req, res, next) => {
  try {
    const data = await getMarketAnalytics({ limit: 10 });
    res.json({
      success: true,
      jobTypeBreakdown: data.jobTypeBreakdown,
      experienceBreakdown: data.experienceBreakdown,
      totalJobsAnalyzed: data.totalJobsAnalyzed,
      dataNote: data.dataNote,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/market/trends — skill demand trends (same as /skills for MVP)
router.get("/trends", async (req, res, next) => {
  try {
    const { role } = req.query;
    const data = await getMarketAnalytics({ role, limit: 30 });
    res.json({ success: true, trends: data.topSkills, meta: { totalJobsAnalyzed: data.totalJobsAnalyzed, dataNote: data.dataNote } });
  } catch (error) {
    next(error);
  }
});

// GET /api/market/skills/:skillId/related
router.get("/skills/:skillId/related", requireAuth, async (req, res, next) => {
  try {
    const result = await getRelatedSkills(req.params.skillId, { limit: 10 });
    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
});

export default router;
