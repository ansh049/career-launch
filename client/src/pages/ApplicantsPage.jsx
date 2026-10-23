import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Mail,
  User,
  Briefcase,
  Calendar,
  CheckCircle2,
  Clock,
  Sparkles,
  Download
} from "lucide-react";
import api from "../services/api";

const statuses = [
  "submitted",
  "reviewing",
  "shortlisted",
  "rejected",
  "hired",
];

const statusStyles = {
  submitted: "bg-blue-50 text-blue-700 border-blue-300 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20",
  reviewing: "bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20",
  shortlisted: "bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20",
  rejected: "bg-rose-50 text-rose-700 border-rose-300 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20",
  hired: "bg-violet-50 text-violet-700 border-violet-300 dark:bg-violet-500/10 dark:text-violet-400 dark:border-violet-500/20",
};

export default function ApplicantsPage() {
  const { jobId } = useParams();
  const [job, setJob] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    api.get(`/api/jobs/${jobId}/applications?page=1&limit=50`)
      .then(({ data }) => {
        if (!Array.isArray(data.applications)) {
          throw new Error("The applicants response was invalid.");
        }
        if (active) {
          setJob(data.job);
          setApplications(data.applications);
        }
      })
      .catch((err) => {
        if (active) {
          setError(
            err.response?.data?.message ||
              err.message ||
              "Unable to load applicants"
          );
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [jobId]);

  async function updateStatus(applicationId, status) {
    try {
      const { data } = await api.patch(
        `/api/applications/${applicationId}/status`,
        { status }
      );

      setApplications((current) =>
        current.map((item) =>
          item._id === applicationId ? data.application : item
        )
      );
    } catch (err) {
      setError(err.response?.data?.message || "Status update failed");
    }
  }

  async function downloadResume(application) {
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
      setError("Unable to download resume.");
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-[#090D16] px-4 py-8 text-slate-900 dark:text-white sm:px-6 md:px-12 lg:px-16 transition-colors">
      <div className="mx-auto max-w-5xl">
        <Link
          to="/recruiter/jobs"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 dark:text-cyan-400 hover:text-blue-500 dark:hover:text-cyan-300 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>← Manage jobs</span>
        </Link>

        {/* Heading */}
        <div className="mt-4 border-b border-slate-200 dark:border-slate-800/80 pb-6">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Applicants
          </h1>
          {job && (
            <p className="mt-2 text-sm sm:text-base text-slate-600 dark:text-slate-400">
              {job.title} · {job.company}
            </p>
          )}
        </div>

        {error && (
          <p role="alert" className="mt-6 rounded-2xl border border-rose-300 dark:border-rose-500/30 bg-rose-50 dark:bg-rose-500/10 p-4 text-sm text-rose-700 dark:text-red-400">
            {error}
          </p>
        )}

        {loading && (
          <div className="mt-8 flex items-center gap-3 text-slate-500 dark:text-slate-400">
            <span className="h-5 w-5 rounded-full border-2 border-blue-600 dark:border-cyan-400 border-t-transparent animate-spin" />
            <p>Loading applicants...</p>
          </div>
        )}

        <div className="mt-8 space-y-4">
          {!loading && !error && applications.length === 0 && (
            <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-10 text-center shadow-sm">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 mb-4">
                <User className="h-7 w-7" />
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-sm">No applicants yet.</p>
            </div>
          )}

          {!loading &&
            applications.map((application) => {
              const candidate = application.candidate;
              const initial = (candidate?.name || "C").charAt(0).toUpperCase();

              return (
                <article
                  key={application._id}
                  className="rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/60 p-6 shadow-sm dark:shadow-md backdrop-blur-md transition-all hover:border-blue-300 dark:hover:border-slate-700"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 dark:from-cyan-400 dark:to-indigo-600 font-extrabold text-white dark:text-slate-950 text-lg shadow-sm">
                        {initial}
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                          {candidate?.name || "Anonymous Applicant"}
                        </h2>
                        <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
                          <Mail className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
                          <span>{candidate?.email}</span>
                        </p>
                        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                          Current status:{" "}
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize border ${
                              statusStyles[application.status] || ""
                            }`}
                          >
                            {application.status}
                          </span>
                        </p>
                      </div>
                    </div>

                    {/* Resume download button if available */}
                    {application.resume && (
                      <button
                        type="button"
                        onClick={() => downloadResume(application)}
                        className="flex items-center gap-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/60 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all self-start shadow-sm cursor-pointer"
                      >
                        <Download className="h-3.5 w-3.5 text-blue-600 dark:text-cyan-400" />
                        Download Resume
                      </button>
                    )}
                  </div>

                  {/* Cover letter if provided */}
                  {application.coverLetter && (
                    <div className="mt-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 p-4">
                      <p className="text-xs uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                        Candidate Cover Note:
                      </p>
                      <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                        {application.coverLetter}
                      </p>
                    </div>
                  )}

                  {/* Status Dropdown - LABEL EXACT FOR TEST ASSERTION */}
                  <div className="mt-6 border-t border-slate-200 dark:border-slate-800/80 pt-4">
                    <label className="block max-w-xs">
                      <span className="mb-2 block text-xs font-semibold text-slate-600 dark:text-slate-400">
                        Update application status
                      </span>
                      <select
                        value={application.status}
                        onChange={(event) =>
                          updateStatus(application._id, event.target.value)
                        }
                        className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 p-3 text-sm text-slate-900 dark:text-white focus:border-blue-500 dark:focus:border-cyan-400 focus:outline-none"
                      >
                        {statuses.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                </article>
              );
            })}
        </div>
      </div>
    </main>
  );
}