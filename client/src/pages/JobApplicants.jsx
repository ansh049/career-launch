
import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../services/api";

const statuses = [
  "submitted",
  "reviewing",
  "shortlisted",
  "rejected",
  "hired",
];

export default function JobApplicants() {
  const { id } = useParams();

  const [job, setJob] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionMessage, setActionMessage] = useState("");

  const loadApplicants = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const { data } = await api.get(
        `/api/jobs/${id}/applications?page=1&limit=50`
      );

      setJob(data.job);
      setApplications(data.applications);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load applicants for this job."
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadApplicants();
  }, [loadApplicants]);

  async function updateStatus(application, status) {
    setError("");
    setActionMessage("");

    try {
      const { data } = await api.patch(
        `/api/applications/${application._id}/status`,
        { status }
      );

      setApplications((current) =>
        current.map((item) =>
          item._id === application._id
            ? data.application
            : item
        )
      );

      setActionMessage(
        `Status updated to ${status} for ${application.candidate?.name || "applicant"}.`
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to update application status."
      );
    }
  }

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
        err.response?.data?.message || "Unable to download this resume."
      );
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 px-4 py-8 text-slate-900 dark:text-white md:px-8 transition-colors">
      <div className="mx-auto max-w-6xl">
        <Link to="/recruiter/jobs" className="text-blue-600 dark:text-cyan-400 hover:underline">
          ← Manage jobs
        </Link>

        <h1 className="mt-4 text-3xl font-bold">Applicants</h1>
        {job && (
          <p className="mt-2 text-slate-600 dark:text-slate-400">
            {job.title} · {job.company}
          </p>
        )}

        {error && (
          <p role="alert" className="mt-6 rounded-lg border border-rose-300 dark:border-rose-500/30 bg-rose-50 dark:bg-red-950 p-4 text-rose-700 dark:text-red-300">
            {error}
          </p>
        )}

        {actionMessage && (
          <p role="status" className="mt-4 rounded-lg border border-emerald-300 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-950 p-4 text-emerald-700 dark:text-emerald-300">
            {actionMessage}
          </p>
        )}

        {loading && (
          <p className="mt-8 text-slate-500 dark:text-slate-400">Loading applicants...</p>
        )}

        {!loading && !error && applications.length === 0 && (
          <div className="mt-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-sm">
            <h2 className="text-xl font-semibold">No applicants yet</h2>
            <p className="mt-2 text-slate-500 dark:text-slate-400">
              Applications for this job will appear here.
            </p>
          </div>
        )}

        <div className="mt-6 space-y-5">
          {!loading && applications.map((application) => (
            <article
              key={application._id}
              className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm dark:shadow-md"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold">
                    {application.candidate?.name || "Candidate"}
                  </h2>
                  <p className="mt-1 text-slate-500 dark:text-slate-400">
                    {application.candidate?.email}
                  </p>
                  <p className="mt-2 text-sm text-slate-400 dark:text-slate-500">
                    Applied {new Date(application.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <span className="rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1 text-sm font-semibold capitalize">
                  {application.status}
                </span>
              </div>

              {application.coverLetter && (
                <div className="mt-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-4">
                  <h3 className="font-medium text-slate-800 dark:text-slate-200">Cover letter</h3>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600 dark:text-slate-300">
                    {application.coverLetter}
                  </p>
                </div>
              )}

              <div className="mt-5 flex flex-wrap items-end gap-3">
                <button
                  onClick={() => downloadResume(application)}
                  className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer shadow-sm"
                >
                  Download resume
                </button>

                <label className="text-sm text-slate-600 dark:text-slate-400">
                  Update status
                  <select
                    value={application.status}
                    onChange={(event) =>
                      updateStatus(application, event.target.value)
                    }
                    className="ml-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-slate-900 dark:text-white"
                  >
                    {statuses.map((status) => (
                      <option key={status} value={status}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}
