import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Briefcase,
  PlusCircle,
  Users,
  Eye,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import api from "../services/api";
import LogoutButton from "../components/LogoutButton";

export default function RecruiterDashboard() {
  const [jobs, setJobs] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/api/jobs/mine?limit=50&page=1")
      .then(({ data }) => setJobs(data.jobs || []))
      .catch((err) =>
        setError(
          err.response?.data?.message || "Could not load recruiter jobs",
        ),
      )
      .finally(() => setLoading(false));
  }, []);

  const publishedCount = jobs.filter((j) => j.status === "published").length;
  const draftCount = jobs.filter((j) => j.status === "draft").length;

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-[#090D16] px-4 py-10 text-slate-900 dark:text-white sm:px-6 md:px-12 lg:px-16 transition-colors duration-200">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800/80 pb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-blue-200/80 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 dark:border-cyan-500/20 dark:bg-cyan-500/10 dark:text-cyan-400 mb-2">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Verified Recruiter Portal</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Recruiter dashboard
            </h1>
            <p className="mt-2 text-sm sm:text-base text-slate-600 dark:text-slate-400">
              Manage your job listings.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/recruiter/jobs/new"
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-3 font-bold text-white shadow-sm shadow-blue-500/20 hover:from-blue-500 hover:to-indigo-500 transition-all text-sm dark:from-cyan-400 dark:to-blue-500 dark:text-slate-950 dark:shadow-cyan-500/20"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Create job</span>
            </Link>
            <LogoutButton />
          </div>
        </div>

        {/* Stats Row */}
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs backdrop-blur-md transition-all hover:shadow-md hover:border-slate-300 dark:border-slate-800/80 dark:bg-slate-900/60 dark:hover:border-slate-700">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Listings</p>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-cyan-500/10 dark:text-cyan-400">
                <Briefcase className="h-4 w-4" />
              </div>
            </div>
            <p className="mt-3 text-3xl font-extrabold text-slate-900 dark:text-white">{jobs.length}</p>
          </div>
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs backdrop-blur-md transition-all hover:shadow-md hover:border-slate-300 dark:border-slate-800/80 dark:bg-slate-900/60 dark:hover:border-slate-700">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Published Active</p>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
                <CheckCircle2 className="h-4 w-4" />
              </div>
            </div>
            <p className="mt-3 text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">{publishedCount}</p>
          </div>
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs backdrop-blur-md transition-all hover:shadow-md hover:border-slate-300 dark:border-slate-800/80 dark:bg-slate-900/60 dark:hover:border-slate-700">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Drafts</p>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400">
                <Clock className="h-4 w-4" />
              </div>
            </div>
            <p className="mt-3 text-3xl font-extrabold text-amber-600 dark:text-amber-400">{draftCount}</p>
          </div>
        </div>

        {/* Error */}
        {error && (
          <p className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm text-red-600 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-red-400">
            {error}
          </p>
        )}

        {/* Loading */}
        {loading && (
          <div className="mt-8 flex items-center gap-3 text-slate-500 dark:text-slate-400">
            <span className="h-5 w-5 rounded-full border-2 border-blue-600 border-t-transparent animate-spin dark:border-cyan-400" />
            <p>Loading your job listings...</p>
          </div>
        )}

        {/* Jobs List */}
        <div className="mt-8 space-y-4">
          {!loading && jobs.map((job) => (
            <article
              key={job._id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs backdrop-blur-md transition-all hover:border-slate-300 hover:shadow-sm dark:border-slate-800/80 dark:bg-slate-900/60 dark:hover:border-slate-700"
            >
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">{job.title}</h2>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize border ${
                      job.status === "published"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20"
                        : "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700"
                    }`}
                  >
                    {job.status}
                  </span>
                </div>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  {job.company} · {job.status}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-sm font-semibold">
                <Link
                  to={`/recruiter/jobs/${job._id}/applicants`}
                  className="flex items-center gap-1.5 text-blue-600 hover:text-blue-500 dark:text-cyan-400 dark:hover:text-cyan-300"
                >
                  <Users className="h-4 w-4" />
                  <span>View applicants</span>
                </Link>
                <Link
                  to={`/jobs/${job._id}`}
                  className="flex items-center gap-1.5 text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
                >
                  <Eye className="h-4 w-4" />
                  <span>View listing</span>
                </Link>
              </div>
            </article>
          ))}

          {!jobs.length && !error && !loading && (
            <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-xs dark:border-slate-800 dark:bg-slate-900/50">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 mb-4 dark:bg-slate-800 dark:text-slate-400">
                <Briefcase className="h-7 w-7" />
              </div>
              <p className="text-slate-500 text-sm dark:text-slate-400">
                You haven't published any jobs yet.
              </p>
              <Link
                to="/recruiter/jobs/new"
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:from-blue-500 hover:to-indigo-500 transition-all dark:from-cyan-400 dark:to-blue-500 dark:text-slate-950"
              >
                Create your first job
              </Link>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
