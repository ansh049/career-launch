import mongoose from "mongoose";

const recommendationFeedbackSchema = new mongoose.Schema(
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
    feedback: {
      type: String,
      required: true,
      enum: ["helpful", "unhelpful", "saved", "dismissed", "applied"],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    notes: {
      type: String,
      maxlength: 1000,
      trim: true,
    },
    scoringVersion: {
      type: String,
      default: "v2.0",
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

recommendationFeedbackSchema.index({ userId: 1, jobId: 1 });

const RecommendationFeedback =
  mongoose.models.RecommendationFeedback ||
  mongoose.model("RecommendationFeedback", recommendationFeedbackSchema);

export default RecommendationFeedback;
