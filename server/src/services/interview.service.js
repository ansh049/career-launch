import InterviewSession from "../models/InterviewSession.js";
import User from "../models/User.js";
import Job from "../models/Job.js";

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://localhost:8000";
const AI_INTERNAL_TOKEN = process.env.AI_INTERNAL_TOKEN || "";

/**
 * Initialize a new AI Mock Interview Session.
 */
export async function startInterviewSession({
  userId,
  jobId,
  role,
  interviewType = "mixed",
  difficulty = "mid",
}) {
  const candidate = await User.findById(userId).lean();
  let candidateSkills = candidate?.skills || [];
  let jobDescription = "";

  if (jobId) {
    const job = await Job.findById(jobId).lean();
    if (job) {
      if (!role) role = job.title;
      jobDescription = job.description || "";
      if (job.skills) {
        candidateSkills = Array.from(new Set([...candidateSkills, ...job.skills]));
      }
    }
  }

  // Request questions from AI service
  const response = await fetch(`${AI_SERVICE_URL}/internal/interviews/generate-questions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Internal-Token": AI_INTERNAL_TOKEN,
    },
    body: JSON.stringify({
      role: role || "Software Engineer",
      interview_type: interviewType,
      difficulty,
      skills: candidateSkills,
      job_description: jobDescription,
    }),
    signal: AbortSignal.timeout(30_000),
  });

  if (!response.ok) {
    throw new Error("AI question generation service unavailable");
  }

  const data = await response.json();
  const questionItems = data.questionSet?.questions || [];

  const session = await InterviewSession.create({
    userId,
    jobId: jobId || null,
    role: role || "Software Engineer",
    interviewType,
    difficulty,
    questionSet: questionItems.map((q) => ({
      id: q.id,
      question: q.question,
      category: q.category,
      expectedCompetency: q.expected_competency,
      difficulty: q.difficulty,
      followUpPrompt: q.follow_up_prompt,
    })),
    answers: [],
    status: "in_progress",
  });

  return session;
}

/**
 * Get interview session with ownership verification.
 */
export async function getInterviewSession(userId, sessionId) {
  const session = await InterviewSession.findOne({ _id: sessionId, userId })
    .populate("jobId", "title company location")
    .lean();

  if (!session) {
    throw new Error("Interview session not found or unauthorized");
  }

  return session;
}

/**
 * Submit and evaluate an answer to a question in the session.
 */
export async function submitInterviewAnswer({ userId, sessionId, questionId, answer }) {
  const session = await InterviewSession.findOne({ _id: sessionId, userId });
  if (!session) {
    throw new Error("Interview session not found or unauthorized");
  }

  const question = session.questionSet.find((q) => q.id === questionId);
  if (!question) {
    throw new Error("Question not found in this interview session");
  }

  // Call AI service to evaluate answer
  const response = await fetch(`${AI_SERVICE_URL}/internal/interviews/evaluate-answer`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Internal-Token": AI_INTERNAL_TOKEN,
    },
    body: JSON.stringify({
      role: session.role,
      question: question.question,
      answer,
      expected_competency: question.expectedCompetency,
    }),
    signal: AbortSignal.timeout(30_000),
  });

  if (!response.ok) {
    throw new Error("Answer evaluation service unavailable");
  }

  const data = await response.json();
  const evaluation = data.evaluation;

  // Check if answer already exists (update or push)
  const existingIndex = session.answers.findIndex((a) => a.questionId === questionId);
  const answerRecord = {
    questionId,
    questionText: question.question,
    answer,
    score: evaluation.score,
    rubricScores: {
      technicalAccuracy: evaluation.rubric_scores?.technical_accuracy || 75,
      communicationClarity: evaluation.rubric_scores?.communication_clarity || 75,
      starAdherence: evaluation.rubric_scores?.star_adherence || 70,
      relevance: evaluation.rubric_scores?.relevance || 75,
    },
    feedback: evaluation.feedback,
    keyStrengths: evaluation.key_strengths || [],
    improvements: evaluation.improvements || [],
    answeredAt: new Date(),
  };

  if (existingIndex >= 0) {
    session.answers[existingIndex] = answerRecord;
  } else {
    session.answers.push(answerRecord);
  }

  await session.save();

  return {
    evaluation,
    session,
  };
}

/**
 * Conclude session, calculate aggregate rubrics and actionable feedback.
 */
export async function finishInterviewSession(userId, sessionId) {
  const session = await InterviewSession.findOne({ _id: sessionId, userId });
  if (!session) {
    throw new Error("Interview session not found or unauthorized");
  }

  const response = await fetch(`${AI_SERVICE_URL}/internal/interviews/finalize-session`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Internal-Token": AI_INTERNAL_TOKEN,
    },
    body: JSON.stringify({
      role: session.role,
      difficulty: session.difficulty,
      answers: session.answers.map((a) => ({
        score: a.score,
        question: a.questionText,
        answer: a.answer,
      })),
    }),
    signal: AbortSignal.timeout(30_000),
  });

  if (!response.ok) {
    throw new Error("Interview finalization service failed");
  }

  const data = await response.json();
  const summary = data.summary;

  session.overallScore = summary.overall_score;
  session.rubricSummary = summary.rubric_summary;
  session.feedbackSummary = summary.feedback_summary;
  session.status = "completed";

  await session.save();
  return session;
}

/**
 * Retrieve user's past interview sessions.
 */
export async function listUserInterviewHistory(userId) {
  return InterviewSession.find({ userId })
    .populate("jobId", "title company")
    .sort({ createdAt: -1 })
    .lean();
}
