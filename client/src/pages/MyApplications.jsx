import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Briefcase,
  Building2,
  Calendar,
  Download,
  Trash2,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  ExternalLink
} from "lucide-react";
import api from "../services/api";

const statusConfig = {
  submitted: {
    label: "Submitted",
    style: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    step: 1,
  },
  reviewing: {
    label: "Reviewing",
    style: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    step: 2,
  },
  shortlisted: {
    label: "Shortlisted",
    style: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    step: 3,
  },
  rejected: {
    label: "Rejected",
    style: "bg-rose-500/10 text-rose-400 border-rose-500/20",
    step: 4,
  },
  hired: {
    label: "Hired",
    style: "bg-violet-500/10 text-violet-400 border-violet-500/20",
    step: 4,
  },
};

export default function MyApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionMessage, setActionMessage] = useState("");

  useEffect(() => {
    let active = true;

    async function loadApplications() {
      try {
        const { data } = await api.get(
          "/api/applications/mine?page=1&limit=50"
        );

        const items = data.applications ?? data.data;
        if (!Array.isArray(items)) {
          throw new Error("The applications response was invalid.");
        }

        if (active) setApplications(items);
      } catch (err) {
        if (active) {
          setError(
            err.response?.data?.message ||
              err.message ||
              "Unable to load your applications."
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadApplications();
    return () => {
      active = false;
    };
  }, []);

  async function downloadResume(application) {
    setError("");

    try {
      const response = await api.get(
        `/api/applications/${application._id}/resume`,
        { responseType: "blob" }
      );

      const blobUrl = URL.createObjectURL(response.data);
      const link = document.createElement("a");

      link.href = blobUrl;
      link.download = application.resume?.originalName || "resume.pdf";

      document.body.appendChild(link);
      link.click();
      link.remove();

      URL.revokeObjectURL(blobUrl);
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to download your resume."
      );
    }
  }

  async function withdraw(application) {
    if (
      !window.confirm(
        "Withdraw this application? You will need to apply again if you change your mind."
      )
    ) {
      return;
    }

    setError("");
    setActionMessage("");

    try {
      await api.delete(`/api/applications/${application._id}`);

      setApplications((current) =>
        current.filter((item) => item._id !== application._id)
      );

      setActionMessage("Application withdrawn.");
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to withdraw this application."
      );
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-[#090D16] px-4 py-8 text-slate-900 dark:text-white sm:px-6 md:px-12 lg:px-16 transition-colors">
      <div className="mx-auto max-w-5xl">
        {/* Back Link */}
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 dark:text-cyan-400 hover:text-blue-500 dark:hover:text-cyan-300 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>← Dashboard</span>
        </Link>

        {/* Heading Header */}
        <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800/80 pb-6">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              My applications
            </h1>
            <p className="mt-2 text-sm sm:text-base text-slate-600 dark:text-slate-400">
              Track the progress of your job and internship applications.
            </p>
          </div>
          {!loading && !error && (
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 shadow-sm">
              Total applied: <span className="font-bold text-blue-600 dark:text-cyan-400">{applications.length}</span>
            </div>
          )}
        </div>

        {/* Error Alert */}
        {error && (
          <p
            role="alert"
            className="mt-6 rounded-2xl border border-rose-300 dark:border-rose-500/30 bg-rose-50 dark:bg-rose-500/10 p-5 text-sm text-rose-700 dark:text-red-300"
          >
            {error}
          </p>
        )}

        {/* Action Status Message */}
        {actionMessage && (
          <p
            role="status"
            className="mt-4 flex items-center gap-2 rounded-2xl border border-emerald-300 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/10 p-4 text-sm text-emerald-700 dark:text-emerald-300"
          >
            <CheckCircle2 className="h-4 w-4" />
            {actionMessage}
          </p>
        )}

        {/* Loading */}
        {loading && (
          <div className="mt-8 flex items-center gap-3 text-slate-500 dark:text-slate-400">
            <span className="h-5 w-5 rounded-full border-2 border-blue-600 dark:border-cyan-400 border-t-transparent animate-spin" />
            <p>Loading applications...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && applications.length === 0 && (
          <div className="mt-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-10 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 mb-4">
              <FileText className="h-7 w-7 text-slate-500 dark:text-slate-400" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">No applications yet</h2>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              Find a suitable job and submit your first application.
            </p>
            <Link
              to="/jobs"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-cyan-400 dark:to-blue-500 px-5 py-2.5 font-bold text-white dark:text-slate-950 shadow-md hover:from-blue-500 hover:to-indigo-500 dark:hover:from-cyan-300 dark:hover:to-blue-400 transition-all text-sm"
            >
              Browse jobs
            </Link>
          </div>
        )}

        {/* Application Cards List */}
        <div className="mt-6 space-y-4">
          {!loading &&
            applications.map((application) => {
              const job = application.job;
              const config = statusConfig[application.status] || statusConfig.submitted;

              return (
                <article
                  key={
                    application._id ||
                    `${application.job?._id}-${application.createdAt}`
                  }
                  className="rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/60 p-6 shadow-sm dark:shadow-md backdrop-blur-md transition-all hover:border-blue-300 dark:hover:border-slate-700"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                        {job?.title || "Job no longer available"}
                      </h2>
                      <p className="mt-1 font-medium text-slate-700 dark:text-slate-300">
                        {job?.company || "Company unavailable"}
                      </p>
                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        {job?.location || "Location unavailable"}
                      </p>
                    </div>

                    <span
                      className={`rounded-full border px-3 py-1 text-xs font-semibold capitalize ${config.style}`}
                    >
                      {application.status}
                    </span>
                  </div>

                  {/* Timeline progress indicator */}
                  <div className="mt-6 rounded-xl border border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-950/40 p-4">
                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                      <div className={`p-1.5 rounded-lg border ${config.step >= 1 ? 'border-blue-400 bg-blue-50 text-blue-700 dark:border-cyan-500/40 dark:bg-cyan-500/10 dark:text-cyan-300 font-semibold' : 'border-slate-200 text-slate-400 dark:border-slate-800 dark:text-slate-500'}`}>
                        1. Submitted
                      </div>
                      <div className={`p-1.5 rounded-lg border ${config.step >= 2 ? 'border-amber-400 bg-amber-50 text-amber-700 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-300 font-semibold' : 'border-slate-200 text-slate-400 dark:border-slate-800 dark:text-slate-500'}`}>
                        2. Under Review
                      </div>
                      <div className={`p-1.5 rounded-lg border ${config.step >= 3 ? 'border-emerald-400 bg-emerald-50 text-emerald-700 dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:text-emerald-300 font-semibold' : 'border-slate-200 text-slate-400 dark:border-slate-800 dark:text-slate-500'}`}>
                        3. Decision
                      </div>
                    </div>
                  </div>

                  {/* Metadata dates */}
                  <div className="mt-4 flex flex-wrap gap-x-6 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                    <p>
                      Applied:{" "}
                      <span className="text-slate-700 dark:text-slate-300 font-medium">
                        {application.createdAt
                          ? new Date(application.createdAt).toLocaleDateString()
                          : "Date unavailable"}
                      </span>
                    </p>
                    <p>
                      Last status update:{" "}
                      <span className="text-slate-700 dark:text-slate-300 font-medium">
                        {application.statusUpdatedAt || application.updatedAt
                          ? new Date(
                              application.statusUpdatedAt || application.updatedAt
                            ).toLocaleDateString()
                          : "Date unavailable"}
                      </span>
                    </p>
                    <p>
                      Resume:{" "}
                      <span className="text-blue-600 dark:text-cyan-400 font-medium">
                        {application.resume?.originalName || "Uploaded PDF"}
                      </span>
                    </p>
                  </div>

                  {/* Action buttons */}
                  <div className="mt-6 flex flex-wrap gap-3 border-t border-slate-200 dark:border-slate-800/70 pt-4">
                    {job?._id && (
                      <Link
                        to={`/jobs/${job._id}`}
                        className="flex items-center gap-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/60 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-400 dark:hover:border-slate-600 transition-all shadow-sm"
                      >
                        <ExternalLink className="h-3.5 w-3.5 text-blue-600 dark:text-cyan-400" />
                        View job
                      </Link>
                    )}

                    <button
                      type="button"
                      onClick={() => downloadResume(application)}
                      className="flex items-center gap-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/60 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-400 dark:hover:border-slate-600 transition-all shadow-sm cursor-pointer"
                    >
                      <Download className="h-3.5 w-3.5 text-blue-600 dark:text-cyan-400" />
                      Download my resume
                    </button>

                    {application.status === "submitted" && (
                      <button
                        type="button"
                        onClick={() => withdraw(application)}
                        className="flex items-center gap-1.5 rounded-lg border border-rose-300 dark:border-red-800/80 bg-rose-50 dark:bg-red-950/40 px-3.5 py-2 text-xs font-semibold text-rose-700 dark:text-red-300 hover:bg-rose-100 dark:hover:bg-red-950 hover:border-rose-400 dark:hover:border-red-600 transition-all shadow-sm cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Withdraw application
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
        </div>
      </div>
    </main>
  );
}
