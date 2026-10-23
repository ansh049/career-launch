import mongoose from "mongoose";

const jobRiskAssessmentSchema = new mongoose.Schema(
  {
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },
    indicators: [
      {
        type: {
          type: String,
          enum: [
            "payment_request",
            "upfront_fee",
            "impersonation",
            "duplicate_listing",
            "inconsistent_contact",
            "unrealistic_salary",
            "vague_description",
            "suspicious_url",
            "urgency_pressure",
          ],
          required: true,
        },
        signal: { type: String, required: true, maxlength: 500 },
        confidence: { type: Number, min: 0, max: 1, required: true },
      },
    ],
    riskLevel: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      required: true,
      index: true,
    },
    riskScore: { type: Number, min: 0, max: 1 },
    modelVersion: { type: String, default: "1.0" },
    reviewStatus: {
      type: String,
      enum: ["pending", "reviewed_safe", "reviewed_fraudulent", "escalated"],
      default: "pending",
      index: true,
    },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    reviewedAt: { type: Date },
    reviewNotes: { type: String, maxlength: 2000 },
    reportCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Compound index: one risk assessment per job (upsert on re-analysis)
jobRiskAssessmentSchema.index({ jobId: 1 }, { unique: true });
jobRiskAssessmentSchema.index({ riskLevel: 1, reviewStatus: 1 });

const JobRiskAssessment = mongoose.model("JobRiskAssessment", jobRiskAssessmentSchema);
export default JobRiskAssessment;
