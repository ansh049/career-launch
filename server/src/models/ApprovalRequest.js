import mongoose from "mongoose";

const approvalRequestSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    agentSessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AgentSession",
      required: true,
      index: true,
    },
    actionType: {
      type: String,
      required: true,
      enum: ["apply_job", "save_roadmap", "tailor_resume", "send_notification"],
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    payload: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      index: true,
    },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours validity
      index: true,
    },
    decidedAt: {
      type: Date,
      default: null,
    },
    decisionNotes: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

approvalRequestSchema.index({ userId: 1, status: 1 });

const ApprovalRequest =
  mongoose.models.ApprovalRequest ||
  mongoose.model("ApprovalRequest", approvalRequestSchema);

export default ApprovalRequest;
