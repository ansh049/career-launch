import mongoose from "mongoose";

const applicationEventSchema = new mongoose.Schema({
  applicationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Application",
    required: true,
    index: true,
  },
  actorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  eventType: {
    type: String,
    required: true,
    enum: [
      "status_change",
      "note_added",
      "interview_scheduled",
      "reminder_created",
      "applied",
      "document_uploaded",
    ],
  },
  fromStatus: {
    type: String,
    default: null,
  },
  toStatus: {
    type: String,
    default: null,
  },
  note: {
    type: String,
    default: "",
    maxlength: 2000,
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true,
  },
});

applicationEventSchema.index({ applicationId: 1, timestamp: -1 });

const ApplicationEvent =
  mongoose.models.ApplicationEvent ||
  mongoose.model("ApplicationEvent", applicationEventSchema);

export default ApplicationEvent;
