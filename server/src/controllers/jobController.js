
import mongoose from "mongoose";
import Job from "../models/Job.js";

import {
  createJobSchema,
  updateJobSchema,
  jobStatusSchema,
  jobListQuerySchema,
} from "../validators/jobSchemas.js";

function validationMessage(error) {
  return error.issues?.map((issue) => issue.message).join(", ") ||
    "Invalid request";
}

function parseJobId(id) {
  return mongoose.isValidObjectId(id);
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function normalizeJobInput(input) {
  const data = { ...input };

  if (Array.isArray(data.skills)) {
    data.skills = [
      ...new Map(
        data.skills.map((skill) => [
          skill.toLowerCase(),
          skill.trim(),
        ])
      ).values(),
    ];
  }

  if (Array.isArray(data.responsibilities)) {
    data.responsibilities = data.responsibilities.map(
      (item) => item.trim()
    );
  }

  if (Array.isArray(data.requirements)) {
    data.requirements = data.requirements.map(
      (item) => item.trim()
    );
  }

  if (data.applicationDeadline !== undefined) {
    data.applicationDeadline =
      data.applicationDeadline === null
        ? null
        : new Date(data.applicationDeadline);
  }

  return data;
}

function validateApplicationDeadline(data) {
  if (
    data.applicationDeadline instanceof Date &&
    Number.isNaN(data.applicationDeadline.getTime())
  ) {
    return "Invalid application deadline";
  }

  if (
    data.applicationDeadline instanceof Date &&
    data.applicationDeadline <= new Date()
  ) {
    return "Application deadline must be in the future";
  }

  return null;
}

// POST /api/jobs
export async function createJob(req, res, next) {
  try {
    const parsed = createJobSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: validationMessage(parsed.error),
      });
    }

    const data = normalizeJobInput(parsed.data);
    const deadlineError = validateApplicationDeadline(data);

    if (deadlineError) {
      return res.status(400).json({
        success: false,
        message: deadlineError,
      });
    }

    const job = await Job.create({
      ...data,
      recruiter: req.user._id,
    });

    return res.status(201).json({
      success: true,
      message: "Job created successfully",
      job,
    });
  } catch (error) {
    next(error);
  }
}

// GET /api/jobs
export async function listJobs(req, res, next) {
  try {
    const parsed = jobListQuerySchema.safeParse(req.query);

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: validationMessage(parsed.error),
      });
    }

    const {
      q,
      location,
      employmentType,
      workMode,
      experienceLevel,
      skills,
      sort,
      page,
      limit,
    } = parsed.data;

   const filter = {
  status: "published",
  $and: [
    {
      $or: [
        { applicationDeadline: null },
        { applicationDeadline: { $exists: false } },
        { applicationDeadline: { $gt: new Date() } },
      ],
    },
  ],
};

  if (q) {
  const regex = new RegExp(escapeRegex(q), "i");

  filter.$and.push({
    $or: [
      { title: regex },
      { company: regex },
      { description: regex },
      { skills: regex },
    ],
  });
}

    if (location) {
      filter.location = new RegExp(escapeRegex(location), "i");
    }

    if (employmentType) filter.employmentType = employmentType;
    if (workMode) filter.workMode = workMode;
    if (experienceLevel) filter.experienceLevel = experienceLevel;

    if (skills) {
      const requestedSkills = skills
        .split(",")
        .map((skill) => skill.trim())
        .filter(Boolean)
        .slice(0, 10);

      if (requestedSkills.length > 0) {
        filter.skills = {
          $in: requestedSkills.map(
            (skill) => new RegExp(`^${escapeRegex(skill)}$`, "i")
          ),
        };
      }
    }

    const sortOptions = {
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 },
      salary_desc: { "salary.max": -1, createdAt: -1 },
      salary_asc: { "salary.min": 1, createdAt: -1 },
    };

    const skip = (page - 1) * limit;

    const [jobs, total] = await Promise.all([
      Job.find(filter)
        .populate("recruiter", "name")
        .sort(sortOptions[sort])
        .skip(skip)
        .limit(limit)
        .lean(),

      Job.countDocuments(filter),
    ]);

    return res.json({
      success: true,
      jobs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
        hasPreviousPage: page > 1,
      },
    });
  } catch (error) {
    next(error);
  }
}

// GET /api/jobs/:id
export async function getJobById(req, res, next) {
  try {
    if (!parseJobId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid job ID",
      });
    }

    const job = await Job.findOne({
      _id: req.params.id,
      status: "published",
    })
      .populate("recruiter", "name")
      .lean();

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Published job not found",
      });
    }

    return res.json({ success: true, job });
  } catch (error) {
    next(error);
  }
}

// GET /api/jobs/mine
export async function listMyJobs(req, res, next) {
  try {
    const parsed = jobListQuerySchema.safeParse(req.query);

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: validationMessage(parsed.error),
      });
    }

    const {
      q,
      location,
      employmentType,
      workMode,
      experienceLevel,
      skills,
      sort,
      page,
      limit,
    } = parsed.data;

    const filter = { recruiter: req.user._id };

    if (q) {
      const regex = new RegExp(escapeRegex(q), "i");
      filter.$or = [
        { title: regex },
        { company: regex },
        { description: regex },
        { skills: regex },
      ];
    }

    if (location) {
      filter.location = new RegExp(escapeRegex(location), "i");
    }

    if (employmentType) filter.employmentType = employmentType;
    if (workMode) filter.workMode = workMode;
    if (experienceLevel) filter.experienceLevel = experienceLevel;

    if (skills) {
      const requestedSkills = skills
        .split(",")
        .map((skill) => skill.trim())
        .filter(Boolean)
        .slice(0, 10);

      if (requestedSkills.length) {
        filter.skills = {
          $in: requestedSkills.map(
            (skill) => new RegExp(`^${escapeRegex(skill)}$`, "i")
          ),
        };
      }
    }

    const sortOptions = {
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 },
      salary_desc: { "salary.max": -1, createdAt: -1 },
      salary_asc: { "salary.min": 1, createdAt: -1 },
    };

    const skip = (page - 1) * limit;

    const [jobs, total] = await Promise.all([
      Job.find(filter)
        .sort(sortOptions[sort])
        .skip(skip)
        .limit(limit)
        .lean(),
      Job.countDocuments(filter),
    ]);

    return res.json({
      success: true,
      jobs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
        hasPreviousPage: page > 1,
      },
    });
  } catch (error) {
    next(error);
  }
}

// PATCH /api/jobs/:id
export async function updateJob(req, res, next) {
  try {
    if (!parseJobId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid job ID",
      });
    }

    const parsed = updateJobSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: validationMessage(parsed.error),
      });
    }

    const data = normalizeJobInput(parsed.data);
    const deadlineError = validateApplicationDeadline(data);

    if (deadlineError) {
      return res.status(400).json({
        success: false,
        message: deadlineError,
      });
    }

    const job = await Job.findOneAndUpdate(
      {
        _id: req.params.id,
        recruiter: req.user._id,
      },
      { $set: data },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found or you do not own this job",
      });
    }

    return res.json({
      success: true,
      message: "Job updated successfully",
      job,
    });
  } catch (error) {
    next(error);
  }
}

// PATCH /api/jobs/:id/status
export async function updateJobStatus(req, res, next) {
  try {
    if (!parseJobId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid job ID",
      });
    }

    const parsed = jobStatusSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: validationMessage(parsed.error),
      });
    }

    const job = await Job.findOne({
      _id: req.params.id,
      recruiter: req.user._id,
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found or you do not own this job",
      });
    }

    if (
      parsed.data.status === "published" &&
      job.applicationDeadline &&
      job.applicationDeadline <= new Date()
    ) {
      return res.status(400).json({
        success: false,
        message: "Cannot publish a job with a past application deadline",
      });
    }

    job.status = parsed.data.status;
    await job.save();

    return res.json({
      success: true,
      message: `Job status changed to ${job.status}`,
      job,
    });
  } catch (error) {
    next(error);
  }
}

// DELETE /api/jobs/:id
export async function deleteJob(req, res, next) {
  try {
    if (!parseJobId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid job ID",
      });
    }

    const job = await Job.findOneAndDelete({
      _id: req.params.id,
      recruiter: req.user._id,
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found or you do not own this job",
      });
    }

    return res.json({
      success: true,
      message: "Job deleted successfully",
    });
  } catch (error) {
    next(error);
  }
}
