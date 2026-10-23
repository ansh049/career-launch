import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import {
  getSkillGraph,
  getRelatedSkills,
  getSkillPathForRole,
  refreshSkillGraphFromJobPostings,
} from "../services/skillGraph.service.js";

const router = Router();

// GET /api/career/graph
router.get("/graph", async (req, res, next) => {
  try {
    const { limit = 50, category } = req.query;
    const graph = await getSkillGraph({
      limit: Math.min(parseInt(limit) || 50, 200),
      category,
    });
    res.json({ success: true, ...graph });
  } catch (error) {
    next(error);
  }
});

// GET /api/career/skills/:skillId/related
router.get("/skills/:skillId/related", async (req, res, next) => {
  try {
    const { limit = 10 } = req.query;
    const result = await getRelatedSkills(req.params.skillId, {
      limit: Math.min(parseInt(limit) || 10, 30),
    });
    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
});

// GET /api/career/roles/:roleId/skill-path
router.get("/roles/:roleId/skill-path", async (req, res, next) => {
  try {
    const { startSkills } = req.query;
    const result = await getSkillPathForRole(req.params.roleId, {
      startSkills: startSkills ? String(startSkills).split(",").map(s => s.trim()) : [],
    });
    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
});

export default router;
