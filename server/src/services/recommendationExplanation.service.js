import Job from "../models/Job.js";
import User from "../models/User.js";
import RecommendationFeedback from "../models/RecommendationFeedback.js";
import { getRecommendations } from "./ai.service.js";
import { explainMatch } from "./explanation.service.js";

/**
 * Build synthesized candidate resume text if missing.
 */
function getCandidateProfileText(candidate) {
  let resumeText = candidate?.resumeText || "";
  if (resumeText.trim().length >= 20) return resumeText.trim();

  const parts = [];
  if (candidate?.headline) parts.push(candidate.headline);
  if (candidate?.bio) parts.push(candidate.bio);
  if (candidate?.skills && candidate.skills.length > 0) {
    parts.push(`Skills: ${candidate.skills.join(", ")}`);
  }
  if (candidate?.education && candidate.education.length > 0) {
    const eduStr = candidate.education
      .map((e) => `${e.degree || ""} in ${e.fieldOfStudy || ""} at ${e.institution || ""}`)
      .join(". ");
    parts.push(`Education: ${eduStr}`);
  }
  return parts.join(". ").trim();
}

/**
 * Get detailed explainable match for a single job and candidate.
 */
export async function getJobExplanation(userId, jobId) {
  const [candidate, job] = await Promise.all([
    User.findById(userId).select("+resumeText").lean(),
    Job.findById(jobId).lean(),
  ]);

  if (!candidate) {
    throw new Error("Candidate profile not found");
  }
  if (!job) {
    throw new Error("Job not found");
  }

  const resumeText = getCandidateProfileText(candidate);
  if (resumeText.length < 10) {
    return {
      success: true,
      jobId,
      title: job.title,
      company: job.company,
      explanation: {
        summary: "Upload a resume or add skills to view personalized match explanations.",
        strengths: [],
        skill_gaps: job.skills || [],
        next_steps: ["Complete candidate profile", "Add key skills"],
      },
      score_components: {
        semantic_score: 0,
        skill_score: 0,
        experience_score: 0,
        scoring_version: "v2.0",
      },
      evidence: {
        matched_skills: [],
        missing_skills: job.skills || [],
        experience_fit: "Pending Profile",
      },
      scoring_version: "v2.0",
    };
  }

  // Get matching result from AI service
  const aiResult = await getRecommendations(
    resumeText,
    [
      {
        id: String(job._id),
        title: job.title,
        company: job.company,
        description: job.description || "",
        skills: job.skills || [],
        location: job.location || "",
        job_type: job.jobType || "",
        work_mode: job.workMode || "",
        experience_level: job.experienceLevel || "",
      },
    ],
    candidate.skills || []
  );

  const match = aiResult?.recommendations?.[0] || {
    job_id: String(job._id),
    title: job.title,
    company: job.company,
    similarity_score: 50,
    matched_skills: [],
    missing_skills: job.skills || [],
    score_components: {
      semantic_score: 50,
      skill_score: 50,
      experience_score: 50,
      scoring_version: "v2.0",
    },
    evidence: {
      matched_skills: [],
      missing_skills: job.skills || [],
      experience_fit: "Moderate",
    },
    scoring_version: "v2.0",
  };

  // Get qualitative narrative explanation
  let narrativeExplanation;
  try {
    const explainRes = await explainMatch({
      title: job.title,
      company: job.company,
      matched_skills: match.matched_skills || [],
      missing_skills: match.missing_skills || [],
      similarity_score: match.similarity_score || 0,
    });
    narrativeExplanation = explainRes?.explanation;
  } catch {
    narrativeExplanation = {
      summary: `Detailed alignment for ${job.title} at ${job.company} with ${match.matched_skills?.length || 0} matching core competencies.`,
      strengths: match.matched_skills || [],
      skill_gaps: match.missing_skills || [],
      next_steps: [
        "Emphasize matched technical skills in your cover letter",
        "Review key requirements prior to interview",
      ],
    };
  }

  // Check if candidate already gave feedback on this recommendation
  const existingFeedback = await RecommendationFeedback.findOne({
    userId,
    jobId,
  }).lean();

  return {
    success: true,
    jobId: String(job._id),
    title: job.title,
    company: job.company,
    similarity_score: match.similarity_score,
    composite_score: match.composite_score,
    score_components: match.score_components,
    evidence: match.evidence,
    matched_skills: match.matched_skills,
    missing_skills: match.missing_skills,
    required_skills: match.required_skills,
    explanation: narrativeExplanation,
    userFeedback: existingFeedback?.feedback || null,
    scoring_version: match.scoring_version || "v2.0",
  };
}

/**
 * Record feedback for a job recommendation.
 */
export async function saveRecommendationFeedback({
  userId,
  jobId,
  feedback,
  rating,
  notes,
  scoringVersion = "v2.0",
}) {
  const record = await RecommendationFeedback.findOneAndUpdate(
    { userId, jobId },
    {
      feedback,
      rating,
      notes,
      scoringVersion,
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  return record;
}

/**
 * Fetch candidate's recommendation interaction history.
 */
export async function getCandidateFeedbackHistory(userId) {
  return RecommendationFeedback.find({ userId })
    .populate("jobId", "title company location jobType experienceLevel")
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();
}
