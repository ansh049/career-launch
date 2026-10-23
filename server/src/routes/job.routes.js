import { Router } from "express";
import mongoose from "mongoose";
import { z } from "zod";
import Job from "../models/Job.js";
import { requireAuth, allowRoles } from "../middleware/auth.middleware.js";

const router = Router();

const jobSchema = z.object({
  title: z.string().trim().min(2).max(120),
  company: z.string().trim().min(2).max(120),
  description: z.string().trim().min(20).max(20000),
  skills: z.array(z.string().trim().min(1).max(60)).max(50).default([]),
  location: z.string().trim().max(120).default("Remote"),
  jobType: z.enum(["internship", "full-time", "part-time"]),
  experienceLevel: z.enum(["fresher", "entry", "experienced"]).default("fresher"),
  salaryMin: z.number().min(0).optional(),
  salaryMax: z.number().min(0).optional(),
  deadline: z.coerce.date().optional()
}).strict();

router.get("/", async (req, res, next) => {
  try {
    const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, Number.parseInt(req.query.limit, 10) || 10));

    const filter = { status: "published" };

    if (req.query.type) filter.jobType = req.query.type;
    if (req.query.location) {
      filter.location = { $regex: String(req.query.location), $options: "i" };
    }
    if (req.query.q) {
      filter.$text = { $search: String(req.query.q).slice(0, 100) };
    }

    const [jobs, total] = await Promise.all([
      Job.find(filter)
        .populate("createdBy", "name")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Job.countDocuments(filter)
    ]);

    res.json({
      success: true,
      data: jobs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
});

router.get(
  "/recruiter/mine",
  requireAuth,
  allowRoles("recruiter"),
  async (req, res, next) => {
    try {
      const jobs = await Job.find({ createdBy: req.user._id })
        .sort({ createdAt: -1 });

      res.json({ success: true, data: jobs });
    } catch (error) {
      next(error);
    }
  }
);

router.get("/:id", async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid job ID" });
    }

    const job = await Job.findOne({
      _id: req.params.id,
      status: "published"
    }).populate("createdBy", "name");

    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }

    res.json({ success: true, data: job });
  } catch (error) {
    next(error);
  }
});

router.post("/", requireAuth, allowRoles("recruiter"), async (req, res, next) => {
  try {
    const parsed = jobSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid job data",
        errors: parsed.error.flatten()
      });
    }

    const { salaryMin, salaryMax } = parsed.data;

    if (salaryMin !== undefined && salaryMax !== undefined && salaryMin > salaryMax) {
      return res.status(400).json({
        success: false,
        message: "Minimum salary cannot exceed maximum salary"
      });
    }

    const job = await Job.create({
      ...parsed.data,
      createdBy: req.user._id
    });

    res.status(201).json({ success: true, data: job });
  } catch (error) {
    next(error);
  }
});

router.patch("/:id", requireAuth, allowRoles("recruiter"), async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid job ID" });
    }

    const parsed = jobSchema.partial().strict().safeParse(req.body);

    if (!parsed.success || Object.keys(parsed.data || {}).length === 0) {
      return res.status(400).json({ success: false, message: "Invalid job update" });
    }

    const job = await Job.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.user._id },
      { $set: parsed.data },
      { new: true, runValidators: true }
    );

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found or you do not own it"
      });
    }

    res.json({ success: true, data: job });
  } catch (error) {
    next(error);
  }
});

router.patch("/:id/close", requireAuth, allowRoles("recruiter"), async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid job ID" });
    }

    const job = await Job.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.user._id },
      { $set: { status: "closed" } },
      { new: true }
    );

    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }

    res.json({ success: true, data: job });
  } catch (error) {
    next(error);
  }
});

export default router;