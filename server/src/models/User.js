import mongoose from "mongoose";
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 80,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
      select: false,
    },
    refreshTokenHash: {
      type: String,
      default: null,
      select: false,
    },
    role: {
      type: String,
      enum: ["candidate", "recruiter"],
      default: "candidate",
    },
    recruiterVerified: {
      type: Boolean,
      default: false,
    },
    headline: {
      type: String,
      trim: true,
      maxlength: 160,
      default: "",
    },
    phone: {
      type: String,
      trim: true,
      maxlength: 40,
      default: "",
    },
    location: {
      type: String,
      trim: true,
      maxlength: 120,
      default: "",
    },
    bio: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: "",
    },
    links: {
      linkedin: { type: String, trim: true, default: "" },
      github: { type: String, trim: true, default: "" },
      portfolio: { type: String, trim: true, default: "" },
    },
    skills: {
      type: [String],
      default: [],
    },
    education: [
      {
        degree: { type: String, trim: true, default: "" },
        institution: { type: String, trim: true, default: "" },
        fieldOfStudy: { type: String, trim: true, default: "" },
        graduationYear: { type: String, trim: true, default: "" },
        score: { type: String, trim: true, default: "" },
      },
    ],
    experience: [
      {
        title: { type: String, trim: true, default: "" },
        company: { type: String, trim: true, default: "" },
        startDate: { type: String, trim: true, default: "" },
        endDate: { type: String, trim: true, default: "" },
        description: { type: String, trim: true, default: "" },
      },
    ],
    resumeUrl: {
      type: String,
      default: "",
    },
    resumeText: {
      type: String,
      default: "",
      select: false,
    },
    profileCompleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("User", userSchema);
