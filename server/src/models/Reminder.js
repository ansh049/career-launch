import mongoose from "mongoose";

const reminderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    applicationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Application",
      default: null,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    note: {
      type: String,
      default: "",
      maxlength: 1000,
    },
    dueAt: {
      type: Date,
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ["follow_up", "interview", "deadline", "task"],
      default: "follow_up",
    },
    status: {
      type: String,
      enum: ["pending", "completed", "dismissed"],
      default: "pending",
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

reminderSchema.index({ userId: 1, dueAt: 1, status: 1 });

const Reminder =
  mongoose.models.Reminder || mongoose.model("Reminder", reminderSchema);

export default Reminder;
