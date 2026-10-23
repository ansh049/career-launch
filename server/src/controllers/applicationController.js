
import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import mongoose from "mongoose";

import Application from "../models/Application.js";
import Job from "../models/Job.js";
import { recordApplicationEvent } from "../services/applicationTimeline.service.js";

import {
  createApplicationSchema,
  updateApplicationStatusSchema,
  listApplicationsQuerySchema,
} from "../validators/applicationSchemas.js";

const PRIVATE_UPLOAD_DIR = fileURLToPath(
  new URL("../../private_uploads/", import.meta.url)
);

function invalidId(id) {
  return !mongoose.isValidObjectId(id);
}

function validationMessage(error) {
  return (
    error.issues?.map((issue) => issue.message).join(", ") ||
    "Invalid request"
  );
}

function safeOriginalName(name) {
  // Store only a harmless display name, never a filesystem path.
  const base = path.basename(name || "resume.pdf")
    .replace(/[^\w.\- ()]/g, "_")
    .slice(0, 200);

  return base.toLowerCase().endsWith(".pdf")
    ? base
    : `${base}.pdf`;
}

function publicApplication(application) {
  const item = application.toObject
    ? application.toObject()
    : application;

  if (item.resume) {
    delete item.resume.storageKey;
    delete item.resume.sha256;
  }

  return item;
}

async function removeStoredResume(storageKey) {
  if (!storageKey || !/^[a-f0-9-]+\.pdf$/i.test(storageKey)) {
    return;
  }

  try {
    await fs.unlink(path.join(PRIVATE_UPLOAD_DIR, storageKey));
  } catch (error) {
    if (error.code !== "ENOENT") {
      console.error("Failed to remove private resume:", error.message);
    }
  }
}

// POST /api/jobs/:jobId/applications
export async function submitApplication(req, res, next) {
  let storedPath;

  try {
    if (invalidId(req.params.jobId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid job ID",
      });
    }

    const parsed = createApplicationSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: validationMessage(parsed.error),
      });
    }

    if (!req.file?.buffer) {
      return res.status(400).json({
        success: false,
        message: "A PDF resume is required.",
      });
    }

    const job = await Job.findOne({
      _id: req.params.jobId,
      status: "published",
      $or: [
        { applicationDeadline: null },
        { applicationDeadline: { $exists: false } },
        { applicationDeadline: { $gt: new Date() } },
      ],
    }).select("_id recruiter status applicationDeadline");

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job is not available for applications.",
      });
    }

    const existing = await Application.exists({
      job: job._id,
      candidate: req.user._id,
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: "You have already applied to this job.",
      });
    }

    const storageKey = `${crypto.randomUUID()}.pdf`;
    const sha256 = crypto
      .createHash("sha256")
      .update(req.file.buffer)
      .digest("hex");

    await fs.mkdir(PRIVATE_UPLOAD_DIR, {
      recursive: true,
      mode: 0o700,
    });

    storedPath = path.join(PRIVATE_UPLOAD_DIR, storageKey);

    // "wx" prevents overwriting an existing file.
    await fs.writeFile(storedPath, req.file.buffer, {
      flag: "wx",
      mode: 0o600,
    });

    const application = await Application.create({
      job: job._id,
      candidate: req.user._id,
      coverLetter: parsed.data.coverLetter,
      resume: {
        storageKey,
        originalName: safeOriginalName(req.file.originalname),
        mimeType: "application/pdf",
        size: req.file.size,
        sha256,
      },
      status: "submitted",
    });

    return res.status(201).json({
      success: true,
      message: "Application submitted successfully.",
      application: publicApplication(application),
    });
  } catch (error) {
    // Remove the file if the database write fails.
    if (storedPath) {
      try {
        await fs.unlink(storedPath);
      } catch (cleanupError) {
        if (cleanupError.code !== "ENOENT") {
          console.error("Resume cleanup failed:", cleanupError.message);
        }
      }
    }

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "You have already applied to this job.",
      });
    }

    next(error);
  }
}

// GET /api/applications/mine
export async function listMyApplications(req, res, next) {
  try {
    const parsed = listApplicationsQuerySchema.safeParse(req.query);

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: validationMessage(parsed.error),
      });
    }

    const { page, limit, status } = parsed.data;
    const filter = { candidate: req.user._id };

    if (status) filter.status = status;

    const skip = (page - 1) * limit;

    const [applications, total] = await Promise.all([
      Application.find(filter)
        .select("+resume.originalName +resume.mimeType +resume.size")
        .populate(
          "job",
          "title company location workMode employmentType status applicationDeadline"
        )
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),

      Application.countDocuments(filter),
    ]);

    return res.json({
      success: true,
      applications: applications.map((item) => ({
        ...item,
        resume: item.resume
          ? {
              originalName: item.resume.originalName,
              mimeType: item.resume.mimeType,
              size: item.resume.size,
            }
          : undefined,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
}

// GET /api/jobs/:jobId/applications
export async function listJobApplications(req, res, next) {
  try {
    if (invalidId(req.params.jobId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid job ID",
      });
    }

    const parsed = listApplicationsQuerySchema.safeParse(req.query);

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: validationMessage(parsed.error),
      });
    }

    const job = await Job.findOne({
      _id: req.params.jobId,
      recruiter: req.user._id,
    }).select("_id title company recruiter");

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found or you do not own it.",
      });
    }

    const { page, limit, status } = parsed.data;
    const filter = { job: job._id };

    if (status) filter.status = status;

    const skip = (page - 1) * limit;

    const [applications, total] = await Promise.all([
      Application.find(filter)
        .populate("candidate", "name email")
        .select("+resume.originalName +resume.mimeType +resume.size")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),

      Application.countDocuments(filter),
    ]);

    return res.json({
      success: true,
      job,
      applications: applications.map((item) => ({
        ...item,
        resume: item.resume
          ? {
              originalName: item.resume.originalName,
              mimeType: item.resume.mimeType,
              size: item.resume.size,
            }
          : undefined,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
}

// GET /api/applications/:id
export async function getApplicationById(req, res, next) {
  try {
    if (invalidId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid application ID",
      });
    }

    const application = await Application.findById(req.params.id)
      .populate(
        "job",
        "title company location recruiter status applicationDeadline"
      )
      .populate("candidate", "name email");

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found.",
      });
    }

    const isCandidate =
      application.candidate._id.toString() ===
      req.user._id.toString();

    const isRecruiter =
      application.job?.recruiter?.toString() ===
      req.user._id.toString();

    if (!isCandidate && !isRecruiter) {
      return res.status(404).json({
        success: false,
        message: "Application not found.",
      });
    }

    return res.json({
      success: true,
      application: publicApplication(application),
    });
  } catch (error) {
    next(error);
  }
}

// PATCH /api/applications/:id/status
export async function updateApplicationStatus(req, res, next) {
  try {
    if (invalidId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid application ID",
      });
    }

    const parsed = updateApplicationStatusSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: validationMessage(parsed.error),
      });
    }

    // Ownership is checked through the associated job in the query.
 const application = await Application.findOne({
  _id: req.params.id,
})
  .populate("job", "recruiter")
  .populate("candidate", "name email");

    if (
      !application ||
      application.job.recruiter.toString() !== req.user._id.toString()
    ) {
      return res.status(404).json({
        success: false,
        message: "Application not found.",
      });
    }

    const previousStatus = application.status;
    application.status = parsed.data.status;
    application.statusUpdatedAt = new Date();

    await application.save();

    try {
      await recordApplicationEvent({
        applicationId: application._id,
        actorId: req.user._id,
        eventType: "status_change",
        fromStatus: previousStatus,
        toStatus: parsed.data.status,
        note: `Status updated from ${previousStatus} to ${parsed.data.status}`,
      });
    } catch {
      // Event logging non-blocking fallback
    }

    return res.json({
      success: true,
      message: "Application status updated.",
      application: publicApplication(application),
    });

  } catch (error) {
    next(error);
  }
}

// GET /api/applications/:id/resume
export async function downloadApplicationResume(req, res, next) {
  try {
    if (invalidId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid application ID",
      });
    }

    const application = await Application.findById(req.params.id)
      .select("+resume.storageKey")
      .populate("job", "recruiter");

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found.",
      });
    }

    const isCandidate =
      application.candidate.toString() === req.user._id.toString();

    const isRecruiter =
      application.job?.recruiter?.toString() === req.user._id.toString();

    if (!isCandidate && !isRecruiter) {
      return res.status(404).json({
        success: false,
        message: "Application not found.",
      });
    }

    const storageKey = application.resume?.storageKey;

    // Never use user-supplied paths to locate a file.
    if (!storageKey || !/^[a-f0-9-]+\.pdf$/i.test(storageKey)) {
      return res.status(404).json({
        success: false,
        message: "Resume file not found.",
      });
    }

    const fullPath = path.join(PRIVATE_UPLOAD_DIR, storageKey);

    try {
      await fs.access(fullPath);
    } catch {
      return res.status(404).json({
        success: false,
        message: "Resume file is unavailable.",
      });
    }

    const filename = safeOriginalName(application.resume.originalName);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Cache-Control", "private, no-store");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${filename.replace(/["\\]/g, "_")}"`
    );

    return res.sendFile(fullPath, (error) => {
      if (error && !res.headersSent) next(error);
    });
  } catch (error) {
    next(error);
  }
}

// DELETE /api/applications/:id
export async function withdrawApplication(req, res, next) {
  try {
    if (invalidId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid application ID",
      });
    }

    const application = await Application.findOne({
      _id: req.params.id,
      candidate: req.user._id,
      status: "submitted",
    }).select("+resume.storageKey");

    if (!application) {
      return res.status(404).json({
        success: false,
        message:
          "Application not found, or it can no longer be withdrawn.",
      });
    }

    const storageKey = application.resume?.storageKey;

    await Application.deleteOne({ _id: application._id });

    // Database removal happens first. File cleanup failures are logged.
    await removeStoredResume(storageKey);

    return res.json({
      success: true,
      message: "Application withdrawn successfully.",
    });
  } catch (error) {
    next(error);
  }
}
