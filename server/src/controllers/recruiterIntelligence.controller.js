import {
  getCandidateMatchesForJob,
  submitCandidateReview,
  generateInterviewKit,
  getShortlistedCandidates,
} from "../services/recruiterIntelligence.service.js";

export async function getCandidateMatches(req, res, next) {
  try {
    const { jobId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const result = await getCandidateMatchesForJob(jobId, req.user._id, {
      page: parseInt(page),
      limit: Math.min(parseInt(limit), 50),
    });
    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
}

export async function reviewCandidate(req, res, next) {
  try {
    const { candidateId } = req.params;
    const { jobId, rubric, notes, decision } = req.body;

    if (!jobId) {
      return res.status(400).json({ success: false, message: "jobId is required" });
    }

    const review = await submitCandidateReview(jobId, candidateId, req.user._id, {
      rubric,
      notes,
      decision,
    });

    res.json({ success: true, review });
  } catch (error) {
    next(error);
  }
}

export async function getInterviewKit(req, res, next) {
  try {
    const { jobId } = req.params;
    const kit = await generateInterviewKit(jobId, req.user._id);
    res.json({ success: true, kit });
  } catch (error) {
    next(error);
  }
}

export async function shortlistCandidates(req, res, next) {
  try {
    const { jobId } = req.params;
    const result = await getShortlistedCandidates(jobId, req.user._id);
    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
}
