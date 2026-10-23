import Reminder from "../models/Reminder.js";
import Application from "../models/Application.js";
import { recordApplicationEvent } from "./applicationTimeline.service.js";

/**
 * Create a new application or career reminder.
 */
export async function createReminder({
  userId,
  applicationId,
  title,
  note = "",
  dueAt,
  type = "follow_up",
}) {
  if (applicationId) {
    const app = await Application.findOne({ _id: applicationId, candidateId: userId }).lean();
    if (!app) {
      throw new Error("Application not found or unauthorized");
    }
  }

  const reminder = await Reminder.create({
    userId,
    applicationId: applicationId || null,
    title,
    note,
    dueAt,
    type,
    status: "pending",
  });

  if (applicationId) {
    await recordApplicationEvent({
      applicationId,
      actorId: userId,
      eventType: "reminder_created",
      note: `Reminder set: ${title}`,
    });
  }

  return reminder;
}

/**
 * Get upcoming reminders for authenticated user.
 */
export async function getUpcomingReminders(userId) {
  return Reminder.find({
    userId,
    status: "pending",
  })
    .populate({
      path: "applicationId",
      populate: { path: "jobId", select: "title company" },
    })
    .sort({ dueAt: 1 })
    .limit(20)
    .lean();
}

/**
 * Update reminder status or properties.
 */
export async function updateReminder(userId, reminderId, updates) {
  const reminder = await Reminder.findOne({ _id: reminderId, userId });
  if (!reminder) {
    throw new Error("Reminder not found or unauthorized");
  }

  if (updates.status) reminder.status = updates.status;
  if (updates.title) reminder.title = updates.title;
  if (updates.note !== undefined) reminder.note = updates.note;
  if (updates.dueAt) reminder.dueAt = updates.dueAt;

  await reminder.save();
  return reminder;
}
