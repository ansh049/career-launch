import { Router } from "express";
import { requireAuth, allowRoles } from "../middleware/auth.middleware.js";
import {
  handleCreateSession,
  handleGetSessionById,
  handleListSessions,
  handleUpdateSuggestion,
  handleExport,
} from "../controllers/resumeCopilot.controller.js";

const router = Router();

router.use(requireAuth);
router.use(allowRoles("candidate"));

router.post("/sessions", handleCreateSession);
router.get("/sessions", handleListSessions);
router.get("/sessions/:id", handleGetSessionById);
router.patch("/sessions/:id/suggestions/:suggestionId", handleUpdateSuggestion);
router.post("/sessions/:id/export", handleExport);

export default router;
