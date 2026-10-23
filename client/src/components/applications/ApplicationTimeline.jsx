import { useEffect, useState } from "react";
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  Calendar,
  MessageSquare,
  FileCheck,
  Bell,
  Plus,
  Send,
  User,
  ShieldAlert
} from "lucide-react";
import api from "../../services/api";

export default function ApplicationTimeline({ applicationId, onClose }) {
  const [timeline, setTimeline] = useState([]);
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Reminder form state
  const [showReminderForm, setShowReminderForm] = useState(false);
  const [reminderTitle, setReminderTitle] = useState("");
  const [reminderDue, setReminderDue] = useState("");
  const [reminderType, setReminderType] = useState("follow_up");
  const [creatingReminder, setCreatingReminder] = useState(false);
  const [reminderNotice, setReminderNotice] = useState("");

  useEffect(() => {
    let active = true;

    async function fetchTimeline() {
      try {
        const res = await api.get(`/api/applications/${applicationId}/timeline`);
        if (active) {
          setTimeline(res.data?.events || []);
          setApplication(res.data?.application || null);
        }
      } catch (err) {
        if (active) setError(err.response?.data?.message || "Failed to load timeline.");
      } finally {
        if (active) setLoading(false);
      }
    }

    if (applicationId) fetchTimeline();

    return () => {
      active = false;
    };
  }, [applicationId]);

  async function handleCreateReminder(e) {
    e.preventDefault();
    if (!reminderTitle || !reminderDue) return;

    setCreatingReminder(true);
    try {
      await api.post(`/api/applications/${applicationId}/reminders`, {
        title: reminderTitle,
        dueAt: new Date(reminderDue).toISOString(),
        type: reminderType,
      });

      setReminderNotice("Reminder created!");
      setShowReminderForm(false);
      setReminderTitle("");
      setReminderDue("");

      // Refresh timeline events
      const res = await api.get(`/api/applications/${applicationId}/timeline`);
      setTimeline(res.data?.events || []);
      setTimeout(() => setReminderNotice(""), 3000);
    } catch {
      setError("Failed to create reminder.");
    } finally {
      setCreatingReminder(false);
    }
  }

  function getEventIcon(type) {
    switch (type) {
      case "status_change":
        return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
      case "interview_scheduled":
        return <Calendar className="h-4 w-4 text-blue-500" />;
      case "reminder_created":
        return <Bell className="h-4 w-4 text-amber-500" />;
      case "applied":
        return <FileCheck className="h-4 w-4 text-indigo-500" />;
      default:
        return <MessageSquare className="h-4 w-4 text-slate-400" />;
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
            Application Audit Timeline
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Chronological audit log of status transitions and interactions
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowReminderForm(!showReminderForm)}
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 cursor-pointer"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Add Reminder</span>
        </button>
      </div>

      {reminderNotice && (
        <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
          {reminderNotice}
        </div>
      )}

      {/* Quick Add Reminder Form */}
      {showReminderForm && (
        <form
          onSubmit={handleCreateReminder}
          className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/60 space-y-3 animate-fadeIn"
        >
          <h4 className="text-xs font-bold text-slate-900 dark:text-white">Schedule Next Step / Reminder</h4>
          <div className="grid gap-2 sm:grid-cols-3">
            <input
              type="text"
              required
              value={reminderTitle}
              onChange={(e) => setReminderTitle(e.target.value)}
              placeholder="e.g. Follow up on status"
              className="rounded-xl border border-slate-200 bg-white p-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            />
            <input
              type="date"
              required
              value={reminderDue}
              onChange={(e) => setReminderDue(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white p-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            />
            <select
              value={reminderType}
              onChange={(e) => setReminderType(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white p-2 text-xs text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
            >
              <option value="follow_up">Follow Up</option>
              <option value="interview">Interview Preparation</option>
              <option value="deadline">Assessment Deadline</option>
              <option value="task">General Task</option>
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setShowReminderForm(false)}
              className="px-3 py-1 text-xs text-slate-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={creatingReminder}
              className="rounded-xl bg-blue-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-blue-500 dark:bg-cyan-400 dark:text-slate-950"
            >
              {creatingReminder ? "Saving..." : "Save Reminder"}
            </button>
          </div>
        </form>
      )}

      {/* Timeline Stream */}
      {loading ? (
        <div className="py-6 text-center text-xs text-slate-400">Loading timeline history...</div>
      ) : timeline.length === 0 ? (
        <div className="py-6 text-center text-xs text-slate-500 dark:text-slate-400">
          No audit events recorded for this application yet.
        </div>
      ) : (
        <div className="relative space-y-4 before:absolute before:inset-0 before:left-3.5 before:h-full before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
          {timeline.map((event, idx) => (
            <div key={event._id || idx} className="relative flex items-start gap-3">
              <div className="relative z-10 flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
                {getEventIcon(event.eventType)}
              </div>
              <div className="flex-1 rounded-xl border border-slate-200/80 bg-white p-3 text-xs shadow-2xs dark:border-slate-800 dark:bg-slate-900/60">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-slate-900 dark:text-white capitalize">
                    {event.eventType.replace("_", " ")}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {new Date(event.timestamp).toLocaleString()}
                  </span>
                </div>
                {event.note && (
                  <p className="mt-1 text-slate-600 dark:text-slate-300">{event.note}</p>
                )}
                <div className="mt-2 text-[10px] text-slate-400 flex items-center gap-1">
                  <User className="h-3 w-3" />
                  <span>By: {event.actorId?.name || "System"} ({event.actorId?.role || "Authorized User"})</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
