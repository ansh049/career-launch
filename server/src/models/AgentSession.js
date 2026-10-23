import mongoose from "mongoose";

const stepSchema = new mongoose.Schema({
  stepNumber: { type: Number, required: true },
  tool: { type: String, required: true },
  inputPayload: { type: mongoose.Schema.Types.Mixed, default: {} },
  outputPayload: { type: mongoose.Schema.Types.Mixed, default: {} },
  status: { type: String, default: "completed" },
  requiresApproval: { type: Boolean, default: false },
  timestamp: { type: Date, default: Date.now },
});

const agentSessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    goal: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
    status: {
      type: String,
      enum: ["running", "awaiting_approval", "completed", "failed"],
      default: "running",
      index: true,
    },
    currentStep: {
      type: Number,
      default: 0,
    },
    steps: [stepSchema],
    state: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    summary: {
      type: String,
      default: "",
    },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    },
  },
  {
    timestamps: true,
  }
);

agentSessionSchema.index({ userId: 1, createdAt: -1 });

const AgentSession =
  mongoose.models.AgentSession ||
  mongoose.model("AgentSession", agentSessionSchema);

export default AgentSession;
