import ResumeCopilotSession from "../models/ResumeCopilotSession.js";
import User from "../models/User.js";
import Job from "../models/Job.js";

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://localhost:8000";
const AI_INTERNAL_TOKEN = process.env.AI_INTERNAL_TOKEN || "";

/**
 * Initialize a new Resume Copilot tailoring session.
 */
export async function createCopilotSession(userId, jobId) {
  const [candidate, job] = await Promise.all([
    User.findById(userId).select("+resumeText").lean(),
    Job.findById(jobId).lean(),
  ]);

  if (!candidate) throw new Error("Candidate not found");
  if (!job) throw new Error("Job listing not found");

  let resumeText = candidate.resumeText || "";
  if (resumeText.trim().length < 20) {
    // Synthesize fallback from candidate profile
    const parts = [];
    if (candidate.headline) parts.push(candidate.headline);
    if (candidate.bio) parts.push(candidate.bio);
    if (candidate.skills?.length) parts.push(`Skills: ${candidate.skills.join(", ")}`);
    resumeText = parts.join(". ").trim();
  }

  if (resumeText.length < 10) {
    throw new Error("Upload a resume or complete profile skills before starting Resume Copilot");
  }

  const response = await fetch(`${AI_SERVICE_URL}/internal/resume-copilot/analyze`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Internal-Token": AI_INTERNAL_TOKEN,
    },
    body: JSON.stringify({
      resume_text: resumeText,
      job_title: job.title,
      job_description: job.description || "",
      job_skills: job.skills || [],
      candidate_skills: candidate.skills || [],
    }),
    signal: AbortSignal.timeout(35_000),
  });

  if (!response.ok) {
    throw new Error("AI resume tailoring analysis service failed");
  }

  const data = await response.json();
  const copilot = data.copilot;

  const allSuggestions = [
    ...(copilot.summary_suggestions || []),
    ...(copilot.experience_suggestions || []),
    ...(copilot.skills_suggestions || []),
  ].map((s) => ({
    id: s.id,
    section: s.section,
    originalText: s.original_text,
    suggestedText: s.suggested_text,
    reason: s.reason,
    impactFactor: s.impact_factor,
    status: "pending",
  }));

  const session = await ResumeCopilotSession.create({
    userId,
    jobId,
    originalResumeText: resumeText,
    tailoredHeadline: copilot.tailored_headline,
    keywordAlignmentScore: copilot.keyword_alignment_score,
    suggestions: allSuggestions,
    status: "active",
  });

  return session;
}

/**
 * Fetch a session by ID with ownership verification.
 */
export async function getCopilotSessionById(userId, sessionId) {
  const session = await ResumeCopilotSession.findOne({
    _id: sessionId,
    userId,
  })
    .populate("jobId", "title company location skills jobType")
    .lean();

  if (!session) {
    throw new Error("Resume Copilot session not found or unauthorized");
  }

  return session;
}

/**
 * List candidate's copilot sessions.
 */
export async function listCandidateSessions(userId) {
  return ResumeCopilotSession.find({ userId })
    .populate("jobId", "title company location")
    .sort({ createdAt: -1 })
    .lean();
}

/**
 * Update a specific suggestion's status or edited content.
 */
export async function updateSuggestionStatus(userId, sessionId, suggestionId, { status, editedText }) {
  const session = await ResumeCopilotSession.findOne({ _id: sessionId, userId });
  if (!session) {
    throw new Error("Session not found or unauthorized");
  }

  const suggestion = session.suggestions.find((s) => s.id === suggestionId);
  if (!suggestion) {
    throw new Error("Suggestion not found");
  }

  if (status) suggestion.status = status;
  if (editedText !== undefined) suggestion.editedText = editedText;

  await session.save();
  return session;
}

/**
 * Export tailored resume without overwriting original.
 */
export async function exportTailoredResume(userId, sessionId) {
  const session = await ResumeCopilotSession.findOne({ _id: sessionId, userId }).populate(
    "jobId",
    "title company"
  );
  if (!session) {
    throw new Error("Session not found or unauthorized");
  }

  const candidate = await User.findById(userId).lean();

  // Collect accepted/edited suggestions
  const acceptedSummary = session.suggestions.find(
    (s) => s.section === "summary" && (s.status === "accepted" || s.status === "edited")
  );
  const acceptedExperiences = session.suggestions.filter(
    (s) => s.section === "experience" && (s.status === "accepted" || s.status === "edited")
  );
  const acceptedSkills = session.suggestions.find(
    (s) => s.section === "skills" && (s.status === "accepted" || s.status === "edited")
  );

  const tailoredSummary = acceptedSummary
    ? acceptedSummary.editedText || acceptedSummary.suggestedText
    : "Experienced software engineer dedicated to building reliable, high-performance systems.";

  const tailoredExpLines = acceptedExperiences.map((e) => e.editedText || e.suggestedText);

  const tailoredSkillsStr = acceptedSkills
    ? acceptedSkills.editedText || acceptedSkills.suggestedText
    : (candidate.skills || []).join(", ");

  const tailoredMarkdown = `# ${candidate.name || "Candidate Name"}
**Headline:** ${session.tailoredHeadline || session.jobId?.title || "Software Engineer"}
**Email:** ${candidate.email || ""}

---

### Professional Summary
${tailoredSummary}

### Core Competencies & Skills
${tailoredSkillsStr}

### Experience Highlights (Tailored for ${session.jobId?.title || "Target Role"})
${tailoredExpLines.length ? tailoredExpLines.map((line) => `- ${line}`).join("\n") : "- Successfully developed, tested, and maintained web applications across full lifecycle."}

---
*Generated with CareerLaunch Resume Copilot • Preserving Candidate Original Credentials*
`;

  session.approvedVersion = {
    summary: tailoredSummary,
    experiences: tailoredExpLines,
    skills: tailoredSkillsStr.split(",").map((s) => s.trim()),
    tailoredText: tailoredMarkdown,
    exportedAt: new Date(),
  };
  session.status = "exported";

  await session.save();

  return {
    success: true,
    message: "Tailored resume compiled successfully",
    exportedResume: session.approvedVersion,
  };
}
