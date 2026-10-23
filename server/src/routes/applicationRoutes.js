import { Router } from "express";

import { authenticate } from "../middleware/authenticate.js";
import { authorize } from "../middleware/authorize.js";

import {
  listMyApplications,
  getApplicationById,
  updateApplicationStatus,
  downloadApplicationResume,
  withdrawApplication,
} from "../controllers/applicationController.js";
import { getApplicationTimeline } from "../services/applicationTimeline.service.js";
import { createReminder } from "../services/reminder.service.js";

const router = Router();

// All endpoints in this router require authentication.
router.use(authenticate);

router.get(
  "/mine",
  authorize("candidate"),
  listMyApplications
);

router.get(
  "/:id/timeline",
  async (req, res, next) => {
    try {
      const timelineData = await getApplicationTimeline(req.params.id, req.user);
      res.json({ success: true, ...timelineData });
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  "/:id/reminders",
  authorize("candidate"),
  async (req, res, next) => {
    try {
      const { title, note, dueAt, type } = req.body;
      if (!title || !dueAt) {
        return res.status(400).json({
          success: false,
          message: "Title and dueAt are required for an application reminder",
        });
      }

      const reminder = await createReminder({
        userId: req.user._id,
        applicationId: req.params.id,
        title,
        note,
        dueAt,
        type,
      });

      res.status(201).json({ success: true, reminder });
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  "/:id/resume",
  downloadApplicationResume
);

router.patch(
  "/:id/status",
  authorize("recruiter"),
  updateApplicationStatus
);

router.delete(
  "/:id",
  authorize("candidate"),
  withdrawApplication
);

router.get(
  "/:id",
  getApplicationById
);

export default router;
