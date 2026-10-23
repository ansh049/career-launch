import Job from "../models/Job.js";
import JobRiskAssessment from "../models/JobRiskAssessment.js";
import User from "../models/User.js";

const AI_URL = process.env.AI_SERVICE_URL || "http://localhost:8000";
const AI_TOKEN = process.env.AI_INTERNAL_TOKEN || "";

/**
 * Call the AI service to assess job scam risk signals.
 * Returns a default low-risk result if the AI service is unavailable.
 */
async function callRiskAssessment(job) {
  try {
    const response = await fetch(`${AI_URL}/internal/risk/assess-job`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Internal-Token": AI_TOKEN,
      },
      body: JSON.stringify({
        job_id: String(job._id),
        title: job.title,
        company: job.company,
        description: job.description || "",
        salary_min: job.salaryMin || null,
        salary_max: job.salaryMax || null,
        location: job.location || "",
        contact_email: job.contactEmail || "",
        posted_by: String(job.postedBy),
      }),
      signal: AbortSignal.timeout(15_000),
    });

    if (!response.ok) return null;
    const data = await response.json();
    return data?.risk || null;
  } catch {
    return null;
  }
}

/**
 * Heuristic-based local risk scoring when AI service is unavailable.
 */
function heuristicRiskAssessment(job) {
  const indicators = [];
  const desc = (job.description || "").toLowerCase();
  const title = (job.title || "").toLowerCase();

  const paymentPhrases = ["pay to apply", "registration fee", "training fee", "advance payment", "wire transfer"];
  for (const phrase of paymentPhrases) {
    if (desc.includes(phrase)) {
      indicators.push({ type: "payment_request", signal: `Description contains "${phrase}"`, confidence: 0.85 });
    }
  }

  const urgencyPhrases = ["urgent hiring", "immediate joiner", "start today", "no experience needed, earn"];
  for (const phrase of urgencyPhrases) {
    if (desc.includes(phrase) || title.includes(phrase)) {
      indicators.push({ type: "urgency_pressure", signal: `Contains urgency signal: "${phrase}"`, confidence: 0.65 });
    }
  }

  if (desc.length < 100) {
    indicators.push({ type: "vague_description", signal: "Description is unusually short (< 100 characters)", confidence: 0.5 });
  }

  if (job.salaryMin && job.salaryMax && job.salaryMax > job.salaryMin * 10) {
    indicators.push({ type: "unrealistic_salary", signal: "Salary range is implausibly wide", confidence: 0.6 });
  }

  const totalConfidence = indicators.reduce((s, i) => s + i.confidence, 0);
  const riskScore = Math.min(1, totalConfidence / 3);

  let riskLevel = "low";
  if (riskScore >= 0.7) riskLevel = "critical";
  else if (riskScore >= 0.5) riskLevel = "high";
  else if (riskScore >= 0.25) riskLevel = "medium";

  return { indicators, riskScore, riskLevel, modelVersion: "heuristic-1.0" };
}

/**
 * Get or create (upsert) a risk assessment for a job.
 */
export async function getOrCreateRiskAssessment(jobId) {
  const existing = await JobRiskAssessment.findOne({ jobId }).lean();
  if (existing) return existing;

  const job = await Job.findById(jobId).lean();
  if (!job) throw Object.assign(new Error("Job not found"), { status: 404 });

  let riskData = await callRiskAssessment(job);
  if (!riskData) {
    riskData = heuristicRiskAssessment(job);
  }

  const assessment = await JobRiskAssessment.findOneAndUpdate(
    { jobId },
    {
      $set: {
        jobId,
        indicators: riskData.indicators,
        riskLevel: riskData.riskLevel,
        riskScore: riskData.riskScore,
        modelVersion: riskData.modelVersion || "1.0",
        reviewStatus: "pending",
      },
    },
    { upsert: true, new: true }
  );

  return assessment;
}

/**
 * Increment the report count for a job (triggered by user report).
 */
export async function recordJobReport(jobId) {
  const assessment = await getOrCreateRiskAssessment(jobId);

  await JobRiskAssessment.updateOne(
    { jobId },
    { $inc: { reportCount: 1 } }
  );

  return JobRiskAssessment.findOne({ jobId }).lean();
}

/**
 * Get all flagged jobs for admin moderation queue.
 */
export async function getFlaggedJobs({ status = "pending", page = 1, limit = 20 } = {}) {
  const skip = (page - 1) * limit;
  const query = {
    $or: [
      { riskLevel: { $in: ["high", "critical"] } },
      { reportCount: { $gt: 0 } },
    ],
  };
  if (status !== "all") query.reviewStatus = status;

  const [assessments, total] = await Promise.all([
    JobRiskAssessment.find(query)
      .populate("jobId", "title company location status postedBy createdAt")
      .populate("reviewedBy", "name email")
      .sort({ reportCount: -1, riskScore: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    JobRiskAssessment.countDocuments(query),
  ]);

  return { assessments, total, page, pages: Math.ceil(total / limit) };
}

/**
 * Submit a moderation decision on a flagged job.
 */
export async function submitModerationDecision(jobId, reviewerId, { decision, notes }) {
  const ALLOWED = ["reviewed_safe", "reviewed_fraudulent", "escalated"];
  if (!ALLOWED.includes(decision)) {
    throw Object.assign(new Error("Invalid review decision"), { status: 400 });
  }

  const assessment = await JobRiskAssessment.findOne({ jobId });
  if (!assessment) {
    throw Object.assign(new Error("No risk assessment found for this job"), { status: 404 });
  }

  assessment.reviewStatus = decision;
  assessment.reviewedBy = reviewerId;
  assessment.reviewedAt = new Date();
  if (notes) assessment.reviewNotes = notes;
  await assessment.save();

  // If confirmed fraudulent, take down the job listing
  if (decision === "reviewed_fraudulent") {
    await Job.findByIdAndUpdate(jobId, { status: "removed" });
  }

  return assessment.toObject();
}
