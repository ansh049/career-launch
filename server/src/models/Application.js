
import mongoose from "mongoose";

const resumeSchema = new mongoose.Schema(
  {
    storageKey: {
      type: String,
      required: true,
      select: false,
    },
    originalName: {
      type: String,
      required: true,
      maxlength: 255,
    },
    mimeType: {
      type: String,
      enum: ["application/pdf"],
      required: true,
    },
    size: {
      type: Number,
      required: true,
      min: 1,
      max: 5 * 1024 * 1024,
    },
    sha256: {
      type: String,
      required: true,
      select: false,
    },
  },
  { _id: false }
);

const applicationSchema = new mongoose.Schema(
  {
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
      index: true,
    },

    candidate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    resume: {
      type: resumeSchema,
      required: true,
    },

    coverLetter: {
      type: String,
      trim: true,
      maxlength: 5000,
      default: "",
    },

    status: {
      type: String,
      enum: [
        "submitted",
        "reviewing",
        "shortlisted",
        "rejected",
        "hired",
      ],
      default: "submitted",
      required: true,
      index: true,
    },

    statusUpdatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true, versionKey: false }
);

// Enforces one application per candidate per job.
applicationSchema.index(
  { job: 1, candidate: 1 },
  { unique: true, name: "unique_candidate_job_application" }
);

applicationSchema.index({ candidate: 1, createdAt: -1 });
applicationSchema.index({ job: 1, status: 1, createdAt: -1 });

const Application = mongoose.model("Application", applicationSchema);

export default Application;
