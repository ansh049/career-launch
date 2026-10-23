import { Router } from "express";
import { requireAuth, allowRoles } from "../middleware/auth.middleware.js";
import {
  handleCreateSession,
  handleRunStep,
  handleGetSession,
  handleListSessions,
  handleGetApprovals,
  handleDecideApproval,
} from "../controllers/agent.controller.js";

const router = Router();

router.use(requireAuth);
router.use(allowRoles("candidate"));

router.post("/sessions", handleCreateSession);
router.get("/sessions", handleListSessions);
router.get("/sessions/:id", handleGetSession);
router.post("/sessions/:id/run", handleRunStep);

router.get("/approvals", handleGetApprovals);
router.post("/approvals/:id/decision", handleDecideApproval);

export default router;
