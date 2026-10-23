import mongoose from "mongoose";

const candidateReviewSchema = new mongoose.Schema(
  {
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
      index: true,
    },
    candidateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    reviewerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    applicationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Application",
    },
    // AI-generated ranking evidence
    matchScore: { type: Number, min: 0, max: 100 },
    matchedSkills: [{ type: String }],
    missingSkills: [{ type: String }],
    strengthSummary: { type: String, maxlength: 2000 },
    // Human recruiter rubric
    rubric: {
      technicalFit: { type: Number, min: 1, max: 5 },
      experienceLevel: { type: Number, min: 1, max: 5 },
      cultureFit: { type: Number, min: 1, max: 5 },
      communicationSkills: { type: Number, min: 1, max: 5 },
    },
    notes: { type: String, maxlength: 3000 },
    decision: {
      type: String,
      enum: ["shortlisted", "rejected", "on_hold", "interview_scheduled", "pending"],
      default: "pending",
    },
  },
  { timestamps: true }
);

// One review per recruiter per candidate per job
candidateReviewSchema.index(
  { jobId: 1, candidateId: 1, reviewerId: 1 },
  { unique: true }
);
candidateReviewSchema.index({ jobId: 1, decision: 1, matchScore: -1 });

const CandidateReview = mongoose.model("CandidateReview", candidateReviewSchema);
export default CandidateReview;
