import { Router } from "express";
import { requireAuth, allowRoles } from "../middleware/auth.middleware.js";
import {
  handleStartSession,
  handleGetSession,
  handleSubmitAnswer,
  handleFinishSession,
  handleGetHistory,
} from "../controllers/interview.controller.js";

const router = Router();

router.use(requireAuth);
router.use(allowRoles("candidate"));

router.post("/sessions", handleStartSession);
router.get("/history", handleGetHistory);
router.get("/sessions/:id", handleGetSession);
router.post("/sessions/:id/answers", handleSubmitAnswer);
router.post("/sessions/:id/finish", handleFinishSession);

export default router;
