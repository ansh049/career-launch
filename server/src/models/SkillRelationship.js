import mongoose from "mongoose";

const skillRelationshipSchema = new mongoose.Schema(
  {
    sourceSkillId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Skill",
      required: true,
    },
    targetSkillId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Skill",
      required: true,
    },
    relationshipType: {
      type: String,
      enum: [
        "prerequisite",   // source must come before target
        "complementary",  // often learned together
        "successor",      // target is the natural next step from source
        "related",        // general co-occurrence
        "subset_of",      // source is a specialization of target
        "superset_of",    // source is a generalization of target
      ],
      required: true,
    },
    confidence: { type: Number, min: 0, max: 1, required: true },
    evidenceCount: { type: Number, default: 1 },
    roles: [{ type: String, maxlength: 120 }],
  },
  { timestamps: true }
);

skillRelationshipSchema.index(
  { sourceSkillId: 1, targetSkillId: 1, relationshipType: 1 },
  { unique: true }
);
skillRelationshipSchema.index({ sourceSkillId: 1, confidence: -1 });
skillRelationshipSchema.index({ targetSkillId: 1 });

const SkillRelationship = mongoose.model("SkillRelationship", skillRelationshipSchema);
export default SkillRelationship;
