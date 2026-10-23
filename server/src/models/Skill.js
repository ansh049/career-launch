import mongoose from "mongoose";

const skillSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, maxlength: 120, trim: true },
    normalizedName: {
      type: String,
      required: true,
      maxlength: 120,
      lowercase: true,
      trim: true,
    },
    aliases: [{ type: String, maxlength: 120, lowercase: true }],
    category: {
      type: String,
      enum: [
        "programming_language",
        "framework",
        "database",
        "cloud",
        "devops",
        "data_science",
        "design",
        "soft_skill",
        "domain",
        "tool",
        "other",
      ],
      default: "other",
    },
    description: { type: String, maxlength: 1000 },
    popularity: { type: Number, default: 0 },
  },
  { timestamps: true }
);

skillSchema.index({ name: 1 }, { unique: true });
skillSchema.index({ normalizedName: 1 }, { unique: true });
skillSchema.index({ category: 1, popularity: -1 });

const Skill = mongoose.model("Skill", skillSchema);
export default Skill;
