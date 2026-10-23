import { Router } from "express";
import mongoose from "mongoose";
import Application from "../models/Application.js";
import Job from "../models/Job.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { readResume } from "../services/resume-storage.service.js";

const router = Router();

router.get("/:applicationId", requireAuth, async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.applicationId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid application ID"
      });
    }

    const application = await Application.findById(req.params.applicationId);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found"
      });
    }

    const isCandidate =
      application.candidate.toString() === req.user._id.toString();

    let isJobOwner = false;

    if (req.user.role === "recruiter") {
      isJobOwner = Boolean(await Job.exists({
        _id: application.job,
        createdBy: req.user._id
      }));
    }

    if (!isCandidate && !isJobOwner) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to view this resume"
      });
    }

    const buffer = await readResume(application.resumeUrl);

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": 'attachment; filename="resume.pdf"',
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff"
    });

    res.send(buffer);
  } catch (error) {
    if (error.code === "ENOENT") {
      return res.status(404).json({
        success: false,
        message: "Resume file not found"
      });
    }

    next(error);
  }
});

export default router;