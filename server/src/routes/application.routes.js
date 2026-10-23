import { Router } from "express";
import mongoose from "mongoose";
import { z } from "zod";
import Application from "../models/Application.js";
import Job from "../models/Job.js";
import User from "../models/User.js";
import { requireAuth, allowRoles } from "../middleware/auth.middleware.js";
import { resumeUpload } from "../middleware/upload.middleware.js";
import {
  deleteResume,
  readResume,
  storeResume,
} from "../services/resume-storage.service.js";
import { getResumeAnalysis } from "../services/ai.service.js";
import { validateResumeUpload } from "../services/resume-scan.service.js";

const router = Router();

router.post(
  "/",
  requireAuth,
  allowRoles("candidate"),
  (req, res, next) => {
    resumeUpload(req, res, (error) => {
      if (error)
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      next();
    });
  },
  validateResumeUpload,
  async (req, res, next) => {
    let resumeId;
    let application;

    try {
      const schema = z.object({
        jobId: z.string().refine(mongoose.isValidObjectId),
        coverLetter: z.string().max(5000).optional().default(""),
      });

      const parsed = schema.safeParse(req.body);

      if (!parsed.success) {
        return res.status(400).json({
          success: false,
          message: "Invalid application data",
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "A PDF resume is required",
        });
      }

      const job = await Job.findOne({
        _id: parsed.data.jobId,
        status: "published",
      });

      if (!job) {
        return res.status(404).json({
          success: false,
          message: "Published job not found",
        });
      }

      resumeId = await storeResume(req.file.buffer);
      const analysis = await getResumeAnalysis(await readResume(resumeId));

      if (
        typeof analysis.text !== "string" ||
        !Array.isArray(analysis.skills)
      ) {
        throw new Error("Resume analysis returned an invalid response");
      }

      application = await Application.create({
        candidate: req.user._id,
        job: job._id,
        resumeUrl: resumeId,
        coverLetter: parsed.data.coverLetter,
      });

      const candidate = await User.findByIdAndUpdate(
        req.user._id,
        { $set: { resumeText: analysis.text, skills: analysis.skills } },
        { new: true, runValidators: true },
      );

      if (!candidate) throw new Error("Candidate account no longer exists");

      return res.status(201).json({
        success: true,
        message: "Application submitted",
        data: application,
      });
    } catch (error) {
      if (application) {
        await Application.findByIdAndDelete(application._id).catch(() => {});
      }
      if (resumeId) await deleteResume(resumeId).catch(() => {});

      if (error.code === 11000) {
        return res.status(409).json({
          success: false,
          message: "You have already applied for this job",
        });
      }
      next(error);
    }
  },
);

router.get(
  "/me",
  requireAuth,
  allowRoles("candidate"),
  async (req, res, next) => {
    try {
      const applications = await Application.find({
        candidate: req.user._id,
      }).populate("job", "title company location jobType status");

      res.json({ success: true, data: applications });
    } catch (error) {
      next(error);
    }
  },
);

router.get(
  "/jobs/:jobId",
  requireAuth,
  allowRoles("recruiter"),
  async (req, res, next) => {
    try {
      if (!mongoose.isValidObjectId(req.params.jobId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid job ID",
        });
      }

      const job = await Job.findOne({
        _id: req.params.jobId,
        createdBy: req.user._id,
      });

      if (!job) {
        return res.status(404).json({
          success: false,
          message: "Job not found or not owned by you",
        });
      }

      const applications = await Application.find({ job: job._id })
        .populate("candidate", "name email headline skills")
        .sort({ createdAt: -1 });

      res.json({ success: true, data: applications });
    } catch (error) {
      next(error);
    }
  },
);

router.patch(
  "/:id/status",
  requireAuth,
  allowRoles("recruiter"),
  async (req, res, next) => {
    try {
      const schema = z.object({
        status: z.enum(["under_review", "shortlisted", "rejected", "hired"]),
      });

      const parsed = schema.safeParse(req.body);

      if (!parsed.success || !mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid application update",
        });
      }

      const application = await Application.findById(req.params.id);

      if (!application) {
        return res.status(404).json({
          success: false,
          message: "Application not found",
        });
      }

      const job = await Job.findOne({
        _id: application.job,
        createdBy: req.user._id,
      });

      if (!job) {
        return res.status(403).json({
          success: false,
          message: "You cannot modify this application",
        });
      }

      application.status = parsed.data.status;
      await application.save();

      res.json({ success: true, data: application });
    } catch (error) {
      next(error);
    }
  },
);

export default router;
