import mongoose from "mongoose";

const milestoneSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  phase: {
    type: String,
    default: "Core Fundamentals",
    trim: true,
  },
  description: {
    type: String,
    default: "",
  },
  skills: {
    type: [String],
    default: [],
  },
  estimatedHours: {
    type: Number,
    default: 20,
  },
  resources: [
    {
      title: String,
      type: { type: String, default: "documentation" },
      url: String,
      estimatedTime: String,
    },
  ],
  projects: [
    {
      title: String,
      description: String,
      deliverables: [String],
      skills: [String],
    },
  ],
  status: {
    type: String,
    enum: ["not_started", "in_progress", "completed"],
    default: "not_started",
  },
  completedAt: {
    type: Date,
  },
});

const careerRoadmapSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    targetRole: {
      type: String,
      required: true,
      trim: true,
    },
    targetJobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      default: null,
    },
    status: {
      type: String,
      enum: ["active", "completed", "archived"],
      default: "active",
      index: true,
    },
    version: {
      type: Number,
      default: 1,
    },
    overallProgress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    readinessScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    summary: {
      type: String,
      default: "",
    },
    milestones: {
      type: [milestoneSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

careerRoadmapSchema.index({ userId: 1, status: 1 });

const CareerRoadmap =
  mongoose.models.CareerRoadmap ||
  mongoose.model("CareerRoadmap", careerRoadmapSchema);

export default CareerRoadmap;
