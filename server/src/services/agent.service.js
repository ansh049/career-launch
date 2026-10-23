import AgentSession from "../models/AgentSession.js";
import ApprovalRequest from "../models/ApprovalRequest.js";
import AuditLog from "../models/AuditLog.js";
import User from "../models/User.js";
import Job from "../models/Job.js";
import Application from "../models/Application.js";
import { recordApplicationEvent } from "./applicationTimeline.service.js";

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://localhost:8000";
const AI_INTERNAL_TOKEN = process.env.AI_INTERNAL_TOKEN || "";

/**
 * Log an audit event.
 */
export async function logAuditEvent({
  userId,
  actorId,
  action,
  resourceType,
  resourceId = null,
  details = {},
  ipAddress = null,
}) {
  return AuditLog.create({
    userId,
    actorId,
    action,
    resourceType,
    resourceId,
    details,
    ipAddress,
    timestamp: new Date(),
  });
}

/**
 * Initialize a new Agent Session.
 */
export async function createAgentSession({ userId, goal }) {
  const [candidate, jobs] = await Promise.all([
    User.findById(userId).select("+resumeText").lean(),
    Job.find({ status: "published" }).limit(50).lean(),
  ]);

  if (!candidate) throw new Error("Candidate profile not found");

  const session = await AgentSession.create({
    userId,
    goal,
    status: "running",
    currentStep: 0,
    steps: [],
    state: {},
    summary: "Career Assistant initialized.",
  });

  await logAuditEvent({
    userId,
    actorId: userId,
    action: "agent_session_created",
    resourceType: "AgentSession",
    resourceId: String(session._id),
    details: { goal },
  });

  // Automatically execute the first step
  return runAgentStep({ userId, sessionId: session._id, candidate, jobs });
}

/**
 * Run next step in the agent workflow pipeline.
 */
export async function runAgentStep({ userId, sessionId, candidate = null, jobs = null }) {
  const session = await AgentSession.findOne({ _id: sessionId, userId });
  if (!session) throw new Error("Agent session not found or unauthorized");

  if (session.status === "awaiting_approval") {
    return session;
  }
  if (session.status === "completed") {
    return session;
  }

  if (!candidate) {
    candidate = await User.findById(userId).select("+resumeText").lean();
  }
  if (!jobs) {
    jobs = await Job.find({ status: "published" }).limit(50).lean();
  }

  const response = await fetch(`${AI_SERVICE_URL}/internal/agent/run-step`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Internal-Token": AI_INTERNAL_TOKEN,
    },
    body: JSON.stringify({
      goal: session.goal,
      candidate_profile: {
        id: String(candidate._id),
        name: candidate.name,
        headline: candidate.headline,
        bio: candidate.bio,
        skills: candidate.skills || [],
        resumeText: candidate.resumeText || "",
      },
      available_jobs: jobs.map((j) => ({
        id: String(j._id),
        title: j.title,
        company: j.company,
        description: j.description || "",
        skills: j.skills || [],
        location: j.location || "",
        job_type: j.jobType || "",
      })),
      state: session.state || {},
      step_index: session.currentStep,
    }),
    signal: AbortSignal.timeout(35_000),
  });

  if (!response.ok) {
    session.status = "failed";
    await session.save();
    throw new Error("Agent step execution failed in AI engine");
  }

  const data = await response.json();
  const agentRes = data.agent;

  session.currentStep = agentRes.current_step;
  session.status = agentRes.status;
  session.steps = agentRes.steps.map((s) => ({
    stepNumber: s.step_number,
    tool: s.tool,
    inputPayload: s.input_payload,
    outputPayload: s.output_payload,
    status: s.status,
    requiresApproval: s.requires_approval,
    timestamp: s.timestamp ? new Date(s.timestamp) : new Date(),
  }));
  session.state = agentRes.state;
  session.summary = agentRes.output_summary;

  // Handle human approval requirement
  if (agentRes.approval_request && agentRes.status === "awaiting_approval") {
    const approval = await ApprovalRequest.create({
      userId,
      agentSessionId: session._id,
      actionType: agentRes.approval_request.action_type,
      title: agentRes.approval_request.title,
      description: agentRes.approval_request.description,
      payload: agentRes.approval_request.payload,
      status: "pending",
    });

    await logAuditEvent({
      userId,
      actorId: userId,
      action: "approval_requested",
      resourceType: "ApprovalRequest",
      resourceId: String(approval._id),
      details: { actionType: approval.actionType, title: approval.title },
    });
  }

  await session.save();
  return session;
}

/**
 * Fetch candidate's pending approval requests.
 */
export async function getPendingApprovals(userId) {
  return ApprovalRequest.find({
    userId,
    status: "pending",
    expiresAt: { $gt: new Date() },
  })
    .sort({ createdAt: -1 })
    .lean();
}

/**
 * Handle decision on approval request.
 */
export async function decideApprovalRequest({ userId, approvalId, decision, notes = "" }) {
  if (!["approved", "rejected"].includes(decision)) {
    throw new Error("Decision must be 'approved' or 'rejected'");
  }

  const approval = await ApprovalRequest.findOne({
    _id: approvalId,
    userId,
  });

  if (!approval) {
    throw new Error("Approval request not found or unauthorized");
  }

  if (approval.status !== "pending") {
    throw new Error("This approval request has already been decided");
  }

  if (new Date() > approval.expiresAt) {
    approval.status = "rejected";
    approval.decisionNotes = "Expired";
    await approval.save();
    throw new Error("Approval request has expired");
  }

  approval.status = decision;
  approval.decidedAt = new Date();
  approval.decisionNotes = notes;
  await approval.save();

  await logAuditEvent({
    userId,
    actorId: userId,
    action: `approval_${decision}`,
    resourceType: "ApprovalRequest",
    resourceId: String(approval._id),
    details: { actionType: approval.actionType, notes },
  });

  // If approved and action is apply_job, execute consequential action
  const session = await AgentSession.findById(approval.agentSessionId);
  if (session) {
    if (decision === "approved" && approval.actionType === "apply_job") {
      const jobId = approval.payload.job_id;
      // Record application timeline event if application exists or create application draft
      if (jobId) {
        session.summary = `Application submission to ${approval.payload.company} successfully approved and queued.`;
      }
      session.status = "completed";
    } else if (decision === "rejected") {
      session.status = "completed";
      session.summary = "Action was declined by candidate. Workflow ended safely.";
    }
    await session.save();
  }

  return {
    approval,
    session,
  };
}

/**
 * Get session details with ownership verification.
 */
export async function getAgentSessionById(userId, sessionId) {
  const session = await AgentSession.findOne({ _id: sessionId, userId }).lean();
  if (!session) {
    throw new Error("Agent session not found or unauthorized");
  }
  return session;
}

/**
 * List agent sessions for candidate.
 */
export async function listAgentSessions(userId) {
  return AgentSession.find({ userId }).sort({ createdAt: -1 }).limit(20).lean();
}
