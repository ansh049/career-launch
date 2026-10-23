import {
  createAgentSession,
  runAgentStep,
  getAgentSessionById,
  listAgentSessions,
  getPendingApprovals,
  decideApprovalRequest,
} from "../services/agent.service.js";

export async function handleCreateSession(req, res, next) {
  try {
    const { goal } = req.body;
    if (!goal || !goal.trim()) {
      return res.status(400).json({
        success: false,
        message: "A specific career goal is required to start an assistant session",
      });
    }

    const session = await createAgentSession({
      userId: req.user._id,
      goal: goal.trim(),
    });

    res.status(201).json({
      success: true,
      message: "Agent session initiated",
      session,
    });
  } catch (error) {
    next(error);
  }
}

export async function handleRunStep(req, res, next) {
  try {
    const session = await runAgentStep({
      userId: req.user._id,
      sessionId: req.params.id,
    });

    res.json({
      success: true,
      message: "Agent step executed",
      session,
    });
  } catch (error) {
    next(error);
  }
}

export async function handleGetSession(req, res, next) {
  try {
    const session = await getAgentSessionById(req.user._id, req.params.id);
    res.json({ success: true, session });
  } catch (error) {
    next(error);
  }
}

export async function handleListSessions(req, res, next) {
  try {
    const sessions = await listAgentSessions(req.user._id);
    res.json({ success: true, sessions });
  } catch (error) {
    next(error);
  }
}

export async function handleGetApprovals(req, res, next) {
  try {
    const approvals = await getPendingApprovals(req.user._id);
    res.json({ success: true, approvals });
  } catch (error) {
    next(error);
  }
}

export async function handleDecideApproval(req, res, next) {
  try {
    const { decision, notes } = req.body;
    if (!["approved", "rejected"].includes(decision)) {
      return res.status(400).json({
        success: false,
        message: "Decision must be 'approved' or 'rejected'",
      });
    }

    const result = await decideApprovalRequest({
      userId: req.user._id,
      approvalId: req.params.id,
      decision,
      notes,
    });

    res.json({
      success: true,
      message: `Approval request ${decision}`,
      ...result,
    });
  } catch (error) {
    next(error);
  }
}
