
import mongoose from "mongoose";

const salarySchema = new mongoose.Schema(
  {
    min: {
      type: Number,
      min: 0,
      default: null,
    },
    max: {
      type: Number,
      min: 0,
      default: null,
    },
    currency: {
      type: String,
      uppercase: true,
      trim: true,
      default: "INR",
      maxlength: 3,
    },
    period: {
      type: String,
      enum: ["year", "month", "hour"],
      default: "year",
    },
  },
  { _id: false }
);

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 120,
    },

    company: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 120,
    },

    description: {
      type: String,
      required: true,
      trim: true,
      minlength: 30,
      maxlength: 20000,
    },

    responsibilities: {
      type: [String],
      default: [],
      validate: {
        validator: (items) =>
          items.length <= 30 &&
          items.every(
            (item) =>
              typeof item === "string" &&
              item.trim().length > 0 &&
              item.length <= 500
          ),
        message: "Responsibilities must contain up to 30 valid items",
      },
    },

    requirements: {
      type: [String],
      default: [],
      validate: {
        validator: (items) =>
          items.length <= 30 &&
          items.every(
            (item) =>
              typeof item === "string" &&
              item.trim().length > 0 &&
              item.length <= 500
          ),
        message: "Requirements must contain up to 30 valid items",
      },
    },

    skills: {
      type: [String],
      required: true,
      validate: {
        validator: (items) =>
          items.length >= 1 &&
          items.length <= 30 &&
          items.every(
            (skill) =>
              typeof skill === "string" &&
              skill.trim().length > 0 &&
              skill.length <= 50
          ),
        message: "Provide between 1 and 30 valid skills",
      },
    },

    location: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },

    workMode: {
      type: String,
      enum: ["onsite", "remote", "hybrid"],
      default: "onsite",
      required: true,
    },

    employmentType: {
      type: String,
      enum: [
        "full-time",
        "part-time",
        "internship",
        "contract",
      ],
      required: true,
    },

    experienceLevel: {
      type: String,
      enum: [
        "internship",
        "entry",
        "junior",
        "mid",
        "senior",
      ],
      required: true,
    },

    salary: {
      type: salarySchema,
      default: () => ({}),
    },

    applicationDeadline: {
      type: Date,
      default: null,
    },

    status: {
      type: String,
      enum: ["draft", "published", "closed"],
      default: "draft",
      required: true,
      index: true,
    },

    recruiter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Efficient filtering by publication status, location and date.
jobSchema.index({
  status: 1,
  createdAt: -1,
});

jobSchema.index({
  recruiter: 1,
  createdAt: -1,
});

jobSchema.index({
  employmentType: 1,
  workMode: 1,
  experienceLevel: 1,
});

const Job = mongoose.model("Job", jobSchema);

export default Job;
