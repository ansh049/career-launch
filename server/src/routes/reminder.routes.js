import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import {
  createReminder,
  getUpcomingReminders,
  updateReminder,
} from "../services/reminder.service.js";

const router = Router();

router.use(requireAuth);

router.get("/upcoming", async (req, res, next) => {
  try {
    const reminders = await getUpcomingReminders(req.user._id);
    res.json({ success: true, reminders });
  } catch (error) {
    next(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const { title, note, dueAt, type, applicationId } = req.body;
    if (!title || !dueAt) {
      return res.status(400).json({
        success: false,
        message: "Title and dueAt are required for a reminder",
      });
    }

    const reminder = await createReminder({
      userId: req.user._id,
      applicationId,
      title,
      note,
      dueAt,
      type,
    });

    res.status(201).json({ success: true, reminder });
  } catch (error) {
    next(error);
  }
});

router.patch("/:id", async (req, res, next) => {
  try {
    const reminder = await updateReminder(req.user._id, req.params.id, req.body);
    res.json({ success: true, reminder });
  } catch (error) {
    next(error);
  }
});

export default router;
