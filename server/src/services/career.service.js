import CareerRoadmap from "../models/CareerRoadmap.js";
import User from "../models/User.js";
import Job from "../models/Job.js";

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://localhost:8000";
const AI_INTERNAL_TOKEN = process.env.AI_INTERNAL_TOKEN || "";

/**
 * Call AI service for skill gap analysis.
 */
export async function performSkillGapAnalysis({
  userId,
  targetRole,
  targetJobId,
  targetSkills = [],
}) {
  const candidate = await User.findById(userId).lean();
  let candidateSkills = candidate?.skills || [];

  let jobDescription = "";
  let skillsToCompare = [...targetSkills];

  if (targetJobId) {
    const job = await Job.findById(targetJobId).lean();
    if (job) {
      jobDescription = job.description || "";
      if (job.skills && job.skills.length > 0) {
        skillsToCompare = Array.from(new Set([...skillsToCompare, ...job.skills]));
      }
      if (!targetRole) {
        targetRole = job.title;
      }
    }
  }

  const response = await fetch(`${AI_SERVICE_URL}/internal/career/gap-analysis`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Internal-Token": AI_INTERNAL_TOKEN,
    },
    body: JSON.stringify({
      candidate_skills: candidateSkills,
      target_role: targetRole || "Software Engineer",
      target_skills: skillsToCompare,
      job_description: jobDescription,
    }),
    signal: AbortSignal.timeout(30_000),
  });

  if (!response.ok) {
    throw new Error("AI skill gap analysis failed");
  }

  const data = await response.json();
  return data.analysis;
}

/**
 * Generate and persist a personalized career roadmap.
 */
export async function generateRoadmap({
  userId,
  targetRole,
  targetJobId,
  targetSkills = [],
  currentLevel = "Junior",
}) {
  const candidate = await User.findById(userId).lean();
  const candidateSkills = candidate?.skills || [];

  let skillsToCompare = [...targetSkills];
  if (targetJobId) {
    const job = await Job.findById(targetJobId).lean();
    if (job) {
      if (!targetRole) targetRole = job.title;
      if (job.skills) {
        skillsToCompare = Array.from(new Set([...skillsToCompare, ...job.skills]));
      }
    }
  }

  const response = await fetch(`${AI_SERVICE_URL}/internal/career/roadmap`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Internal-Token": AI_INTERNAL_TOKEN,
    },
    body: JSON.stringify({
      candidate_skills: candidateSkills,
      target_role: targetRole || "Full Stack Engineer",
      target_job_id: targetJobId ? String(targetJobId) : null,
      target_skills: skillsToCompare,
      current_level: currentLevel,
    }),
    signal: AbortSignal.timeout(30_000),
  });

  if (!response.ok) {
    throw new Error("AI roadmap generation failed");
  }

  const data = await response.json();
  const aiRoadmap = data.roadmap;

  // Persist into MongoDB
  const newRoadmap = await CareerRoadmap.create({
    userId,
    targetRole: aiRoadmap.target_role,
    targetJobId: targetJobId || null,
    summary: aiRoadmap.summary,
    readinessScore: aiRoadmap.readiness_score,
    milestones: aiRoadmap.milestones.map((m) => ({
      id: m.id,
      title: m.title,
      phase: m.phase,
      description: m.description,
      skills: m.skills,
      estimatedHours: m.estimated_hours,
      resources: m.resources.map((r) => ({
        title: r.title,
        type: r.type,
        url: r.url,
        estimatedTime: r.estimated_time,
      })),
      projects: m.projects.map((p) => ({
        title: p.title,
        description: p.description,
        deliverables: p.deliverables,
        skills: p.skills,
      })),
      status: "not_started",
    })),
    status: "active",
    overallProgress: 0,
  });

  return newRoadmap;
}

/**
 * List candidate roadmaps.
 */
export async function getCandidateRoadmaps(userId) {
  return CareerRoadmap.find({ userId })
    .populate("targetJobId", "title company location")
    .sort({ createdAt: -1 })
    .lean();
}

/**
 * Get roadmap by ID with ownership check.
 */
export async function getCandidateRoadmapById(userId, roadmapId) {
  const roadmap = await CareerRoadmap.findOne({
    _id: roadmapId,
    userId,
  })
    .populate("targetJobId", "title company location")
    .lean();

  if (!roadmap) {
    throw new Error("Career roadmap not found or unauthorized");
  }

  return roadmap;
}

/**
 * Update milestone completion status.
 */
export async function updateMilestoneStatus(userId, roadmapId, milestoneId, status) {
  const roadmap = await CareerRoadmap.findOne({ _id: roadmapId, userId });
  if (!roadmap) {
    throw new Error("Career roadmap not found or unauthorized");
  }

  const milestone = roadmap.milestones.find((m) => m.id === milestoneId);
  if (!milestone) {
    throw new Error("Milestone not found");
  }

  milestone.status = status;
  if (status === "completed") {
    milestone.completedAt = new Date();
  } else {
    milestone.completedAt = null;
  }

  // Recalculate overall progress
  const total = roadmap.milestones.length;
  const completedCount = roadmap.milestones.filter(
    (m) => m.status === "completed"
  ).length;

  roadmap.overallProgress = total > 0 ? Math.round((completedCount / total) * 100) : 0;
  if (roadmap.overallProgress === 100) {
    roadmap.status = "completed";
  } else if (roadmap.status === "completed") {
    roadmap.status = "active";
  }

  await roadmap.save();
  return roadmap;
}
