import { Router } from "express";
import { requireAuth, allowRoles } from "../middleware/auth.middleware.js";
import {
  getCandidateMatches,
  reviewCandidate,
  getInterviewKit,
  shortlistCandidates,
} from "../controllers/recruiterIntelligence.controller.js";

const router = Router();

// All routes require recruiter role
router.use(requireAuth, allowRoles("recruiter"));

// GET /api/recruiter/jobs/:jobId/candidate-matches
router.get("/jobs/:jobId/candidate-matches", getCandidateMatches);

// GET /api/recruiter/jobs/:jobId/shortlist
router.get("/jobs/:jobId/shortlist", shortlistCandidates);

// POST /api/recruiter/jobs/:jobId/shortlist  (alias for clarity)
router.post("/jobs/:jobId/shortlist", shortlistCandidates);

// POST /api/recruiter/candidates/:candidateId/review
router.post("/candidates/:candidateId/review", reviewCandidate);

// POST /api/recruiter/jobs/:jobId/interview-kit
router.post("/jobs/:jobId/interview-kit", getInterviewKit);

export default router;
