import { Router } from "express";
import { authenticate } from "../middleware/authenticate.js";
import { authorize } from "../middleware/authorize.js";
import { uploadResume } from "../middleware/uploadResume.js";
import {
  getProfile,
  parseResumeUpload,
  updateProfile,
} from "../controllers/profileController.js";

const router = Router();

// Candidate-only routes
router.use(authenticate);
router.use(authorize("candidate"));

router.get("/me", getProfile);
router.post("/parse-resume", uploadResume, parseResumeUpload);
router.put("/me", updateProfile);

export default router;
