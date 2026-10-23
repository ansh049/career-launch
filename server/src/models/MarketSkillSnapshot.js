import mongoose from "mongoose";

const marketSkillSnapshotSchema = new mongoose.Schema(
  {
    skillName: { type: String, required: true, maxlength: 120, index: true },
    skillId: { type: mongoose.Schema.Types.ObjectId, ref: "Skill" },
    role: { type: String, maxlength: 120, index: true },
    periodStart: { type: Date, required: true },
    periodEnd: { type: Date, required: true },
    jobCount: { type: Number, required: true, min: 0 },
    listingCount: { type: Number, default: 0 },
    sourceCoverage: { type: String, maxlength: 500 },
    // Frequency: how often this skill appears in job postings in the period
    frequency: { type: Number, min: 0, max: 1 },
    // Co-occurring skills with weights
    coOccurringSkills: [
      {
        skillName: { type: String, maxlength: 120 },
        count: { type: Number, min: 0 },
      },
    ],
    metadata: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true }
);

marketSkillSnapshotSchema.index({ skillName: 1, role: 1, periodStart: -1 });
marketSkillSnapshotSchema.index({ periodStart: 1, periodEnd: 1 });
marketSkillSnapshotSchema.index({ role: 1, frequency: -1 });

const MarketSkillSnapshot = mongoose.model("MarketSkillSnapshot", marketSkillSnapshotSchema);
export default MarketSkillSnapshot;
