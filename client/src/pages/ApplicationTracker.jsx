import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FileText,
  Clock,
  CheckCircle2,
  Calendar,
  Bell,
  Check,
  AlertCircle,
  ExternalLink,
  Building2,
  ArrowRight,
  RefreshCw,
  Plus
} from "lucide-react";
import api from "../services/api";
import ApplicationTimeline from "../components/applications/ApplicationTimeline";

export default function ApplicationTracker() {
  const [applications, setApplications] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [selectedAppId, setSelectedAppId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadData() {
      try {
        const [appsRes, remsRes] = await Promise.all([
          api.get("/api/applications/mine"),
          api.get("/api/reminders/upcoming"),
        ]);

        if (active) {
          const appList = appsRes.data?.applications || [];
          setApplications(appList);
          setReminders(remsRes.data?.reminders || []);
          if (appList.length > 0) {
            setSelectedAppId(appList[0]._id);
          }
        }
      } catch (err) {
        if (active) setError("Failed to load application tracker data.");
      } finally {
        if (active) setLoading(false);
      }
    }

    loadData();
    return () => {
      active = false;
    };
  }, []);

  async function handleToggleReminder(reminderId, currentStatus) {
    const newStatus = currentStatus === "completed" ? "pending" : "completed";
    try {
      await api.patch(`/api/reminders/${reminderId}`, { status: newStatus });
      setReminders((prev) =>
        prev.map((r) => (r._id === reminderId ? { ...r, status: newStatus } : r))
      );
    } catch {
      // Handled silently
    }
  }

  function getStatusBadge(status) {
    switch (status) {
      case "accepted":
      case "offer":
        return "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 border-emerald-300";
      case "rejected":
        return "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400 border-rose-300";
      case "interview":
        return "bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300 border-purple-300";
      case "reviewing":
        return "bg-blue-100 text-blue-700 dark:bg-cyan-500/20 dark:text-cyan-400 border-blue-300";
      default:
        return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-300";
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-[#090D16] px-4 py-10 text-slate-900 dark:text-white sm:px-6 md:px-12 lg:px-16 transition-colors duration-200">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="border-b border-slate-200 dark:border-slate-800/80 pb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-200/80 bg-blue-50 px-3.5 py-1 text-xs font-semibold text-blue-700 dark:border-cyan-500/30 dark:bg-cyan-500/10 dark:text-cyan-400 mb-3">
                <Clock className="h-3.5 w-3.5" />
                <span>Smart Application Lifecycle & Reminders</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                Application Tracker
              </h1>
              <p className="mt-2 text-sm sm:text-base text-slate-600 dark:text-slate-400">
                Track status transitions, interviews, deadlines, and timeline audit logs in one workspace.
              </p>
            </div>

            <Link
              to="/jobs"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm shadow-blue-500/20 hover:from-blue-500 hover:to-indigo-500 dark:from-cyan-400 dark:to-blue-500 dark:text-slate-950"
            >
              <span>Explore More Jobs</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* Upcoming Reminders Bar */}
        <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900/60">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Bell className="h-4 w-4 text-amber-500" />
              <span>Upcoming Follow-Ups & Deadlines ({reminders.length})</span>
            </h3>
          </div>

          {reminders.length === 0 ? (
            <p className="text-xs text-slate-400 py-2">
              No upcoming reminders. Set reminders on any application timeline below!
            </p>
          ) : (
            <div className="grid gap-2.5 sm:grid-cols-3">
              {reminders.map((rem) => {
                const isDone = rem.status === "completed";
                return (
                  <div
                    key={rem._id}
                    className={`flex items-start justify-between rounded-2xl border p-3.5 text-xs transition-all ${
                      isDone
                        ? "border-slate-200 bg-slate-50/60 opacity-60 dark:border-slate-800 dark:bg-slate-950/40"
                        : "border-slate-200 bg-white shadow-2xs dark:border-slate-800 dark:bg-slate-900/80"
                    }`}
                  >
                    <div className="space-y-1">
                      <span className="font-bold text-slate-900 dark:text-white block line-clamp-1">
                        {rem.title}
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-slate-400" />
                        <span>{new Date(rem.dueAt).toLocaleDateString()}</span>
                      </span>
                      {rem.applicationId?.jobId && (
                        <span className="text-[10px] text-blue-600 dark:text-cyan-400 block line-clamp-1">
                          {rem.applicationId.jobId.title} • {rem.applicationId.jobId.company}
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleToggleReminder(rem._id, rem.status)}
                      className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                        isDone
                          ? "bg-emerald-500 border-emerald-500 text-white"
                          : "border-slate-300 hover:border-emerald-500 text-transparent hover:text-emerald-500 dark:border-slate-700"
                      }`}
                    >
                      <Check className="h-3 w-3" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Main Content: Applications List + Timeline Side-by-Side */}
        <div className="mt-8 grid gap-8 lg:grid-cols-12">
          {/* Applications Column (5 cols) */}
          <div className="lg:col-span-5 space-y-3">
            <h3 className="font-extrabold text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              My Submitted Applications ({applications.length})
            </h3>

            {loading ? (
              <div className="py-8 text-center text-xs text-slate-400">Loading applications...</div>
            ) : applications.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center dark:border-slate-800 dark:bg-slate-900/60">
                <FileText className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                <p className="text-xs text-slate-500 dark:text-slate-400">No applications submitted yet.</p>
                <Link
                  to="/jobs"
                  className="mt-3 inline-block text-xs font-bold text-blue-600 dark:text-cyan-400"
                >
                  Browse available opportunities
                </Link>
              </div>
            ) : (
              applications.map((app) => {
                const isSelected = selectedAppId === app._id;
                return (
                  <div
                    key={app._id}
                    onClick={() => setSelectedAppId(app._id)}
                    className={`rounded-2xl border p-4 transition-all cursor-pointer ${
                      isSelected
                        ? "border-blue-500 bg-blue-50/40 ring-1 ring-blue-500/30 dark:border-cyan-400 dark:bg-cyan-500/10 dark:ring-cyan-500/20"
                        : "border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900/60 dark:hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                          {app.job?.title || "Job Application"}
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                          <Building2 className="h-3 w-3" />
                          <span>{app.job?.company || "Company"}</span>
                        </p>
                      </div>
                      <span
                        className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${getStatusBadge(
                          app.status
                        )}`}
                      >
                        {app.status}
                      </span>
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                      <span>Applied: {new Date(app.createdAt).toLocaleDateString()}</span>
                      <span className="text-blue-600 dark:text-cyan-400 font-semibold flex items-center gap-1">
                        <span>View Audit Log</span>
                        <ArrowRight className="h-3 w-3" />
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Timeline Detail Column (7 cols) */}
          <div className="lg:col-span-7">
            {selectedAppId ? (
              <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs dark:border-slate-800 dark:bg-slate-900/60">
                <ApplicationTimeline applicationId={selectedAppId} />
              </div>
            ) : (
              <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center text-xs text-slate-400 dark:border-slate-800 dark:bg-slate-900/60">
                Select an application to view its event timeline and reminders.
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
