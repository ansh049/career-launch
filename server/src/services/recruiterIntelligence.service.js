import Application from "../models/Application.js";
import Job from "../models/Job.js";
import User from "../models/User.js";
import CandidateReview from "../models/CandidateReview.js";

const AI_URL = process.env.AI_SERVICE_URL || "http://localhost:8000";
const AI_TOKEN = process.env.AI_INTERNAL_TOKEN || "";

/**
 * Build AI-powered match evidence for a candidate against a job.
 * Falls back to skill-overlap heuristic if AI is unavailable.
 */
async function buildMatchEvidence(candidate, job) {
  const candidateSkills = (candidate.skills || []).map(s => s.toLowerCase());
  const jobSkills = (job.skills || []).map(s => s.toLowerCase());

  const matchedSkills = candidateSkills.filter(s => jobSkills.includes(s));
  const missingSkills = jobSkills.filter(s => !candidateSkills.includes(s));
  const baseScore = jobSkills.length > 0
    ? Math.round((matchedSkills.length / jobSkills.length) * 100)
    : 50;

  // Try AI explanation if resume text exists
  let strengthSummary = `${matchedSkills.length} of ${jobSkills.length} required skills matched.`;

  try {
    if (candidate.resumeText && candidate.resumeText.length > 20) {
      const response = await fetch(`${AI_URL}/internal/explain-match`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Internal-Token": AI_TOKEN,
        },
        body: JSON.stringify({
          job_title: job.title,
          company: job.company,
          matched_skills: matchedSkills.slice(0, 20),
          missing_skills: missingSkills.slice(0, 20),
          similarity_score: baseScore,
        }),
        signal: AbortSignal.timeout(10_000),
      });

      if (response.ok) {
        const data = await response.json();
        if (data?.explanation?.summary) {
          strengthSummary = data.explanation.summary;
        }
      }
    }
  } catch {
    // Use heuristic summary
  }

  return { matchedSkills, missingSkills, matchScore: baseScore, strengthSummary };
}

/**
 * Get ranked candidate matches for a job (recruiter-only).
 * Verifies the recruiter owns the job before returning data.
 */
export async function getCandidateMatchesForJob(jobId, recruiterId, { page = 1, limit = 20 } = {}) {
  const job = await Job.findOne({ _id: jobId, postedBy: recruiterId }).lean();
  if (!job) {
    throw Object.assign(new Error("Job not found or not authorized"), { status: 403 });
  }

  const applications = await Application.find({ job: jobId })
    .populate("candidate", "name email skills headline bio resumeText")
    .lean();

  // Build match evidence for each applicant
  const matches = await Promise.all(
    applications.map(async (app) => {
      const candidate = app.candidate;
      if (!candidate) return null;
      const evidence = await buildMatchEvidence(candidate, job);
      return {
        applicationId: app._id,
        applicationStatus: app.status,
        appliedAt: app.createdAt,
        candidate: {
          id: candidate._id,
          name: candidate.name,
          email: candidate.email,
          headline: candidate.headline,
          skills: candidate.skills,
        },
        ...evidence,
      };
    })
  );

  const ranked = matches
    .filter(Boolean)
    .sort((a, b) => b.matchScore - a.matchScore);

  const skip = (page - 1) * limit;
  return {
    matches: ranked.slice(skip, skip + limit),
    total: ranked.length,
    page,
    pages: Math.ceil(ranked.length / limit),
    job: { id: job._id, title: job.title, company: job.company },
    disclaimer: "AI match scores are for informational reference only and must not be the sole basis for hiring decisions.",
  };
}

/**
 * Record a recruiter review/decision for a candidate.
 */
export async function submitCandidateReview(jobId, candidateId, reviewerId, reviewData) {
  // Verify recruiter owns the job
  const job = await Job.findOne({ _id: jobId, postedBy: reviewerId }).lean();
  if (!job) {
    throw Object.assign(new Error("Job not found or not authorized"), { status: 403 });
  }

  // Verify candidate actually applied
  const application = await Application.findOne({ job: jobId, candidate: candidateId }).lean();
  if (!application) {
    throw Object.assign(new Error("Candidate has not applied for this job"), { status: 404 });
  }

  const { rubric, notes, decision } = reviewData;
  const evidence = await buildMatchEvidence(
    await User.findById(candidateId).select("skills resumeText").lean() || {},
    job
  );

  const review = await CandidateReview.findOneAndUpdate(
    { jobId, candidateId, reviewerId },
    {
      $set: {
        jobId,
        candidateId,
        reviewerId,
        applicationId: application._id,
        matchScore: evidence.matchScore,
        matchedSkills: evidence.matchedSkills,
        missingSkills: evidence.missingSkills,
        strengthSummary: evidence.strengthSummary,
        rubric: rubric || {},
        notes: notes || "",
        decision: decision || "pending",
      },
    },
    { upsert: true, new: true }
  );

  return review.toObject();
}

/**
 * Generate a structured interview kit for a job (AI-assisted, heuristic fallback).
 */
export async function generateInterviewKit(jobId, recruiterId) {
  const job = await Job.findOne({ _id: jobId, postedBy: recruiterId }).lean();
  if (!job) {
    throw Object.assign(new Error("Job not found or not authorized"), { status: 403 });
  }

  const skills = job.skills || [];
  const technicalQuestions = skills.slice(0, 5).map((skill, i) => ({
    id: `tech-${i + 1}`,
    type: "technical",
    question: `Describe a project where you used ${skill}. What challenges did you face and how did you solve them?`,
    rubric: `Look for: specific examples, problem-solving approach, depth of ${skill} knowledge`,
    skill,
  }));

  const behavioralQuestions = [
    {
      id: "beh-1",
      type: "behavioral",
      question: "Tell me about a time you had to meet a tight deadline. How did you manage your priorities?",
      rubric: "STAR method: Situation, Task, Action, Result. Look for time management and prioritization.",
    },
    {
      id: "beh-2",
      type: "behavioral",
      question: "Describe a situation where you disagreed with a team decision. How did you handle it?",
      rubric: "Look for: professionalism, communication, outcome focus.",
    },
    {
      id: "beh-3",
      type: "behavioral",
      question: "Give an example of when you learned a new skill quickly to complete a project.",
      rubric: "Look for: learning agility, initiative, application of learning.",
    },
  ];

  const roleSpecificQuestions = [];
  if (job.experienceLevel === "senior" || job.experienceLevel === "lead") {
    roleSpecificQuestions.push({
      id: "role-1",
      type: "leadership",
      question: "Describe your experience mentoring junior team members or leading technical decisions.",
      rubric: "Look for: leadership style, specific examples, impact.",
    });
  }

  return {
    jobId,
    jobTitle: job.title,
    company: job.company,
    generatedAt: new Date().toISOString(),
    questions: [...technicalQuestions, ...behavioralQuestions, ...roleSpecificQuestions],
    evaluationGuidelines: [
      "Use the same question set for all candidates to ensure fairness.",
      "Score each answer 1-5 using the provided rubric.",
      "Take notes; do not rely solely on memory.",
      "AI match scores are supplementary evidence, not a final ranking.",
    ],
  };
}

/**
 * Get shortlisted candidates for a job.
 */
export async function getShortlistedCandidates(jobId, recruiterId) {
  const job = await Job.findOne({ _id: jobId, postedBy: recruiterId }).lean();
  if (!job) {
    throw Object.assign(new Error("Job not found or not authorized"), { status: 403 });
  }

  const reviews = await CandidateReview.find({ jobId, decision: "shortlisted" })
    .populate("candidateId", "name email skills headline")
    .lean();

  return { shortlisted: reviews, total: reviews.length };
}
