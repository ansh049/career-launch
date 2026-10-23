import {
  recordJobReport,
  getFlaggedJobs,
  submitModerationDecision,
  getOrCreateRiskAssessment,
} from "../services/jobRisk.service.js";

export async function reportJob(req, res, next) {
  try {
    const { jobId } = req.params;
    const { reason, details } = req.body;

    if (!reason) {
      return res.status(400).json({ success: false, message: "Report reason is required" });
    }

    const assessment = await recordJobReport(jobId);

    res.json({
      success: true,
      message: "Report submitted. Our team will review this listing.",
      reportCount: assessment.reportCount,
    });
  } catch (error) {
    next(error);
  }
}

export async function getJobRiskSummary(req, res, next) {
  try {
    const assessment = await getOrCreateRiskAssessment(req.params.jobId);

    // Only return safe, non-sensitive fields to end users
    res.json({
      success: true,
      riskSummary: {
        riskLevel: assessment.riskLevel,
        flagCount: assessment.indicators?.length || 0,
        reportCount: assessment.reportCount,
        reviewStatus: assessment.reviewStatus,
        note: "This assessment is AI-generated and supplementary. Always exercise judgment when evaluating job listings.",
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function listFlaggedJobs(req, res, next) {
  try {
    const { status = "pending", page = 1, limit = 20 } = req.query;
    const result = await getFlaggedJobs({
      status,
      page: parseInt(page),
      limit: Math.min(parseInt(limit), 100),
    });
    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
}

export async function reviewFlaggedJob(req, res, next) {
  try {
    const { jobId } = req.params;
    const { decision, notes } = req.body;

    const assessment = await submitModerationDecision(jobId, req.user._id, {
      decision,
      notes,
    });

    res.json({
      success: true,
      message: `Moderation decision recorded: ${decision}`,
      assessment,
    });
  } catch (error) {
    next(error);
  }
}
