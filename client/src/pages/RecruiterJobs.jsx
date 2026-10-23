import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  PlusCircle,
  Edit,
  Trash2,
  Users,
  Eye,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Briefcase
} from "lucide-react";
import api from "../services/api";

export default function RecruiterJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");

  const loadJobs = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const { data } = await api.get("/api/jobs/mine?limit=50&page=1");
      setJobs(data.jobs || []);
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to load your job listings.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadJobs();
  }, [loadJobs]);

  async function changeStatus(job, status) {
    setActionError("");

    try {
      const { data } = await api.patch(`/api/jobs/${job._id}/status`, {
        status,
      });

      setJobs((current) =>
        current.map((item) => (item._id === job._id ? data.job : item)),
      );
    } catch (err) {
      setActionError(
        err.response?.data?.message || "Unable to change job status.",
      );
    }
  }

  async function deleteJob(job) {
    const confirmed = window.confirm(
      `Delete "${job.title}"? This action cannot be undone.`,
    );

    if (!confirmed) return;

    setActionError("");

    try {
      await api.delete(`/api/jobs/${job._id}`);

      setJobs((current) => current.filter((item) => item._id !== job._id));
    } catch (err) {
      setActionError(
        err.response?.data?.message || "Unable to delete this job.",
      );
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-[#090D16] px-4 py-8 text-slate-900 dark:text-white sm:px-6 md:px-12 lg:px-16 transition-colors">
      <div className="mx-auto max-w-6xl">
        {/* Header Header */}
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800/80 pb-6">
          <div>
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 dark:text-cyan-400 hover:text-blue-500 dark:hover:text-cyan-300 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>← Dashboard</span>
            </Link>
            <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Manage job listings
            </h1>
            <p className="mt-2 text-sm sm:text-base text-slate-600 dark:text-slate-400">
              Create and manage your opportunities.
            </p>
          </div>

          <Link
            to="/recruiter/jobs/new"
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-cyan-400 dark:to-blue-500 px-5 py-3 font-bold text-white dark:text-slate-950 shadow-md shadow-blue-500/20 dark:shadow-cyan-500/20 hover:from-blue-500 hover:to-indigo-500 dark:hover:from-cyan-300 dark:hover:to-blue-400 transition-all text-sm"
          >
            <PlusCircle className="h-4 w-4" />
            <span>+ Create job</span>
          </Link>
        </header>

        {/* Error Alerts */}
        {error && (
          <p
            role="alert"
            className="mt-6 rounded-2xl border border-rose-300 dark:border-rose-500/30 bg-rose-50 dark:bg-rose-500/10 p-4 text-sm text-rose-700 dark:text-red-300"
          >
            {error}
          </p>
        )}

        {actionError && (
          <p
            role="alert"
            className="mt-4 rounded-2xl border border-rose-300 dark:border-rose-500/30 bg-rose-50 dark:bg-rose-500/10 p-4 text-sm text-rose-700 dark:text-red-300"
          >
            {actionError}
          </p>
        )}

        {/* Loading */}
        {loading && (
          <div className="mt-8 flex items-center gap-3 text-slate-500 dark:text-slate-400">
            <span className="h-5 w-5 rounded-full border-2 border-blue-600 dark:border-cyan-400 border-t-transparent animate-spin" />
            <p className="text-slate-500 dark:text-slate-400">Loading your listings...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && jobs.length === 0 && (
          <div className="mt-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-10 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 mb-4">
              <Briefcase className="h-7 w-7" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">No jobs yet</h2>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              Create your first listing to get started.
            </p>
            <Link
              to="/recruiter/jobs/new"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 dark:bg-cyan-400 px-5 py-2.5 text-xs font-bold text-white dark:text-slate-950 hover:bg-blue-500 dark:hover:bg-cyan-300 transition-all shadow-sm"
            >
              + Create job
            </Link>
          </div>
        )}

        {/* Jobs List */}
        <div className="mt-6 space-y-4">
          {!loading &&
            jobs.map((job) => (
              <article
                key={job._id}
                className="rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/60 p-6 shadow-sm dark:shadow-md backdrop-blur-md transition-all hover:border-blue-300 dark:hover:border-slate-700"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">{job.title}</h2>
                    <p className="mt-1 font-medium text-slate-700 dark:text-slate-300">
                      {job.company} · {job.location}
                    </p>
                    <p className="mt-2 text-xs text-slate-500">
                      Created {new Date(job.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                      job.status === "published"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-300 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20"
                        : job.status === "closed"
                          ? "bg-amber-50 text-amber-700 border border-amber-300 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20"
                          : "bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700"
                    }`}
                  >
                    {job.status}
                  </span>
                </div>

                {/* Action buttons */}
                <div className="mt-6 flex flex-wrap items-center gap-2.5 border-t border-slate-200 dark:border-slate-800/80 pt-4 text-xs font-semibold">
                  <Link
                    to={`/recruiter/jobs/${job._id}/edit`}
                    className="flex items-center gap-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/60 px-3 py-2 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm"
                  >
                    <Edit className="h-3.5 w-3.5" />
                    Edit
                  </Link>

                  {job.status !== "published" && (
                    <button
                      type="button"
                      onClick={() => changeStatus(job, "published")}
                      className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-2 text-white hover:bg-emerald-500 transition-all shadow-sm cursor-pointer"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Publish
                    </button>
                  )}

                  {job.status === "published" && (
                    <button
                      type="button"
                      onClick={() => changeStatus(job, "closed")}
                      className="flex items-center gap-1.5 rounded-lg border border-amber-300 dark:border-amber-700/80 bg-amber-50 dark:bg-amber-950/40 px-3 py-2 text-amber-800 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-950 transition-all shadow-sm cursor-pointer"
                    >
                      <XCircle className="h-3.5 w-3.5" />
                      Close listing
                    </button>
                  )}

                  {job.status === "closed" && (
                    <button
                      type="button"
                      onClick={() => changeStatus(job, "draft")}
                      className="flex items-center gap-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/60 px-3 py-2 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm cursor-pointer"
                    >
                      <RefreshCw className="h-3.5 w-3.5" />
                      Reopen as draft
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => deleteJob(job)}
                    className="flex items-center gap-1.5 rounded-lg border border-rose-300 dark:border-red-800/80 bg-rose-50 dark:bg-red-950/40 px-3 py-2 text-rose-700 dark:text-red-300 hover:bg-rose-100 dark:hover:bg-red-950 transition-all shadow-sm cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete
                  </button>

                  {job.status === "published" && (
                    <Link
                      to={`/jobs/${job._id}`}
                      className="flex items-center gap-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/60 px-3 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      View public listing
                    </Link>
                  )}

                  <Link
                    to={`/recruiter/jobs/${job._id}/applicants`}
                    className="flex items-center gap-1.5 rounded-lg border border-blue-500/30 dark:border-cyan-500/30 bg-blue-50 dark:bg-cyan-500/10 px-3.5 py-2 text-blue-700 dark:text-cyan-300 hover:bg-blue-100 dark:hover:bg-cyan-500/20 transition-all ml-auto shadow-sm"
                  >
                    <Users className="h-3.5 w-3.5" />
                    View applicants
                  </Link>
                </div>
              </article>
            ))}
        </div>
      </div>
    </main>
  );
}
