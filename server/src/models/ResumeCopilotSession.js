import mongoose from "mongoose";

const suggestionSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
  },
  section: {
    type: String,
    enum: ["summary", "experience", "skills"],
    required: true,
  },
  originalText: {
    type: String,
    required: true,
  },
  suggestedText: {
    type: String,
    required: true,
  },
  reason: {
    type: String,
    default: "",
  },
  impactFactor: {
    type: String,
    default: "High",
  },
  status: {
    type: String,
    enum: ["pending", "accepted", "rejected", "edited"],
    default: "pending",
  },
  editedText: {
    type: String,
    default: null,
  },
});

const resumeCopilotSessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
      index: true,
    },
    sourceResumeId: {
      type: String,
      default: null,
    },
    originalResumeText: {
      type: String,
      required: true,
    },
    tailoredHeadline: {
      type: String,
      default: "",
    },
    keywordAlignmentScore: {
      type: Number,
      default: 0,
    },
    suggestions: {
      type: [suggestionSchema],
      default: [],
    },
    approvedVersion: {
      summary: { type: String, default: "" },
      experiences: { type: [String], default: [] },
      skills: { type: [String], default: [] },
      tailoredText: { type: String, default: "" },
      exportedAt: { type: Date, default: null },
    },
    status: {
      type: String,
      enum: ["active", "exported", "archived"],
      default: "active",
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

resumeCopilotSessionSchema.index({ userId: 1, jobId: 1 });

const ResumeCopilotSession =
  mongoose.models.ResumeCopilotSession ||
  mongoose.model("ResumeCopilotSession", resumeCopilotSessionSchema);

export default ResumeCopilotSession;
