
import { Router } from "express";

import { uploadResume } from "../middleware/uploadResume.js";
import { submitApplication, listJobApplications } from "../controllers/applicationController.js";


import {
  createJob,
  listJobs,
  getJobById,
  listMyJobs,
  updateJob,
  updateJobStatus,
  deleteJob,
} from "../controllers/jobController.js";

import { authenticate } from "../middleware/authenticate.js";
import { authorize } from "../middleware/authorize.js";

const router = Router();

// Public candidate-facing endpoints.
router.get("/", listJobs);

router.post(
  "/:jobId/applications",
  authenticate,
  authorize("candidate"),
  uploadResume,
  submitApplication
);

router.get(
  "/:jobId/applications",
  authenticate,
  authorize("recruiter"),
  listJobApplications
);

router.get("/mine", authenticate, authorize("recruiter"), listMyJobs);

// Recruiter-only create endpoint.
router.post(
  "/",
  authenticate,
  authorize("recruiter"),
  createJob
);

// Specific path before the generic :id path.
router.patch(
  "/:id/status",
  authenticate,
  authorize("recruiter"),
  updateJobStatus
);

router.get("/:id", getJobById);

router.patch(
  "/:id",
  authenticate,
  authorize("recruiter"),
  updateJob
);

router.delete(
  "/:id",
  authenticate,
  authorize("recruiter"),
  deleteJob
);

export default router;
