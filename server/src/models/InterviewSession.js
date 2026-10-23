import mongoose from "mongoose";

const answerRecordSchema = new mongoose.Schema({
  questionId: {
    type: String,
    required: true,
  },
  questionText: {
    type: String,
    required: true,
  },
  answer: {
    type: String,
    required: true,
  },
  score: {
    type: Number,
    min: 0,
    max: 100,
    default: 75,
  },
  rubricScores: {
    technicalAccuracy: { type: Number, default: 75 },
    communicationClarity: { type: Number, default: 75 },
    starAdherence: { type: Number, default: 70 },
    relevance: { type: Number, default: 75 },
  },
  feedback: {
    type: String,
    default: "",
  },
  keyStrengths: {
    type: [String],
    default: [],
  },
  improvements: {
    type: [String],
    default: [],
  },
  answeredAt: {
    type: Date,
    default: Date.now,
  },
});

const interviewSessionSchema = new mongoose.Schema(
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
      default: null,
    },
    role: {
      type: String,
      required: true,
      trim: true,
    },
    interviewType: {
      type: String,
      enum: ["technical", "behavioral", "mixed"],
      default: "mixed",
    },
    difficulty: {
      type: String,
      enum: ["entry", "mid", "senior"],
      default: "mid",
    },
    questionSet: [
      {
        id: String,
        question: String,
        category: String,
        expectedCompetency: String,
        difficulty: String,
        followUpPrompt: String,
      },
    ],
    answers: [answerRecordSchema],
    overallScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    rubricSummary: {
      technicalFit: { type: Number, default: 0 },
      communication: { type: Number, default: 0 },
      problemSolving: { type: Number, default: 0 },
      experienceRelevance: { type: Number, default: 0 },
    },
    feedbackSummary: {
      strengths: { type: [String], default: [] },
      improvementAreas: { type: [String], default: [] },
      recommendations: { type: [String], default: [] },
    },
    status: {
      type: String,
      enum: ["in_progress", "completed"],
      default: "in_progress",
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

interviewSessionSchema.index({ userId: 1, createdAt: -1 });

const InterviewSession =
  mongoose.models.InterviewSession ||
  mongoose.model("InterviewSession", interviewSessionSchema);

export default InterviewSession;
