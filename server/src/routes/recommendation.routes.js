import { Router } from "express";
import { requireAuth, allowRoles } from "../middleware/auth.middleware.js";
import Job from "../models/Job.js";
import User from "../models/User.js";
import { getRecommendations } from "../services/ai.service.js";
import { explainMatch } from "../services/explanation.service.js";
import {
  getJobExplanation,
  saveRecommendationFeedback,
  getCandidateFeedbackHistory,
} from "../services/recommendationExplanation.service.js";

const router = Router();

router.get(
  "/me",
  requireAuth,
  allowRoles("candidate"),
  async (req, res, next) => {
    try {
      const candidate = await User.findById(req.user._id).select("+resumeText");
      let resumeText = candidate?.resumeText || "";

      // If resumeText is empty or short, synthesize from candidate profile details
      if (resumeText.trim().length < 20) {
        const parts = [];
        if (candidate?.headline) parts.push(candidate.headline);
        if (candidate?.bio) parts.push(candidate.bio);
        if (candidate?.skills && candidate.skills.length > 0) {
          parts.push(`Skills: ${candidate.skills.join(", ")}`);
        }
        if (candidate?.education && candidate.education.length > 0) {
          const eduStr = candidate.education
            .map(
              (e) =>
                `${e.degree || ""} in ${e.fieldOfStudy || ""} at ${e.institution || ""}`
            )
            .join(". ");
          parts.push(`Education: ${eduStr}`);
        }
        resumeText = parts.join(". ").trim();
      }

      if (resumeText.trim().length < 10) {
        return res.status(400).json({
          success: false,
          message:
            "Upload a resume or complete your profile skills before requesting recommendations",
        });
      }

      const jobs = await Job.find({ status: "published" }).limit(200).lean();

      const result = await getRecommendations(
        resumeText,
        jobs.map((job) => ({
          id: String(job._id),
          title: job.title,
          company: job.company,
          description: job.description || "",
          skills: job.skills || [],
          location: job.location || "",
          job_type: job.jobType || "",
          work_mode: job.workMode || "",
          experience_level: job.experienceLevel || "",
        })),
        candidate?.skills || []
      );

      res.json(result);
    } catch (error) {
      next(error);
    }
  },
);

router.post(
  "/explain",
  requireAuth,
  allowRoles("candidate"),
  async (req, res, next) => {
    try {
      const { title, company, matched_skills, missing_skills, similarity_score } = req.body;
      const result = await explainMatch({
        title,
        company,
        matched_skills: matched_skills || [],
        missing_skills: missing_skills || [],
        similarity_score: Number(similarity_score) || 0,
      });
      res.json(result);
    } catch (error) {
      res.json({
        success: true,
        explanation: {
          summary: `High semantic relevance for ${req.body.title || "this position"} at ${req.body.company || "the company"} matching your background.`,
          strengths: req.body.matched_skills || [],
          skill_gaps: req.body.missing_skills || [],
          next_steps: [
            "Tailor your application to highlight your matched skills",
            "Familiarize yourself with the missing skills",
          ],
        },
      });
    }
  },
);

// Week 1 Proposed Endpoints:
router.get(
  "/explanations/:jobId",
  requireAuth,
  allowRoles("candidate"),
  async (req, res, next) => {
    try {
      const result = await getJobExplanation(req.user._id, req.params.jobId);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  "/feedback",
  requireAuth,
  allowRoles("candidate"),
  async (req, res, next) => {
    try {
      const { jobId, feedback, rating, notes, scoringVersion } = req.body;
      if (!jobId || !feedback) {
        return res.status(400).json({
          success: false,
          message: "Job ID and feedback action are required",
        });
      }

      const record = await saveRecommendationFeedback({
        userId: req.user._id,
        jobId,
        feedback,
        rating: rating ? Number(rating) : undefined,
        notes,
        scoringVersion,
      });

      res.json({
        success: true,
        message: "Recommendation feedback recorded successfully",
        data: record,
      });
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  "/history",
  requireAuth,
  allowRoles("candidate"),
  async (req, res, next) => {
    try {
      const history = await getCandidateFeedbackHistory(req.user._id);
      res.json({
        success: true,
        history,
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
