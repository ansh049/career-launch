import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  ArrowLeft,
  Building2,
  MapPin,
  Briefcase,
  Clock,
  Sparkles,
  DollarSign,
  Calendar,
  FileCheck,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  FileText,
  X
} from "lucide-react";
import api from "../services/api";

const MAX_RESUME_SIZE = 5 * 1024 * 1024;

export default function JobDetails() {
  const { id } = useParams();
  const user = useSelector((state) => state.auth.user);

  const [job, setJob] = useState(null);
  const [loadedJobId, setLoadedJobId] = useState(null);
  const [error, setError] = useState("");
  const [resume, setResume] = useState(null);
  const [coverLetter, setCoverLetter] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [applyMessage, setApplyMessage] = useState("");
  const [applyError, setApplyError] = useState("");
  const loading = loadedJobId !== id;

  useEffect(() => {
    let active = true;

    api.get(`/api/jobs/${id}`)
      .then(({ data }) => {
        if (active) {
          setJob(data.job);
          setError("");
        }
      })
      .catch((err) => {
        if (active) {
          setError(
            err.response?.data?.message || "Unable to load this job."
          );
        }
      })
      .finally(() => {
        if (active) setLoadedJobId(id);
      });

    return () => {
      active = false;
    };
  }, [id]);

  function handleResumeChange(event) {
    const file = event.target.files?.[0] || null;

    setApplyError("");
    setApplyMessage("");

    if (!file) {
      setResume(null);
      return;
    }

    if (!file.name.toLowerCase().endsWith(".pdf")) {
      setResume(null);
      setApplyError("Please select a PDF resume.");
      event.target.value = "";
      return;
    }

    if (file.size > MAX_RESUME_SIZE) {
      setResume(null);
      setApplyError("Resume must be 5 MB or smaller.");
      event.target.value = "";
      return;
    }

    setResume(file);
  }

  function clearResume() {
    setResume(null);
    const input = document.getElementById("resume-upload");
    if (input) input.value = "";
  }

  async function handleApply(event) {
    event.preventDefault();

    setApplyError("");
    setApplyMessage("");

    if (!user) {
      setApplyError("Please sign in as a candidate to apply.");
      return;
    }

    if (user.role !== "candidate") {
      setApplyError("Only candidate accounts can apply to jobs.");
      return;
    }

    if (!resume) {
      setApplyError("Please attach your PDF resume.");
      return;
    }

    const formData = new FormData();
    formData.append("resume", resume);
    formData.append("coverLetter", coverLetter);

    setSubmitting(true);

    try {
      const { data } = await api.post(
        `/api/jobs/${id}/applications`,
        formData,
      );

      setApplyMessage(data.message);
      setResume(null);
      setCoverLetter("");

      const input = document.getElementById("resume-upload");
      if (input) input.value = "";
    } catch (err) {
      setApplyError(
        err.response?.data?.message ||
          "Unable to submit your application."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-[#090D16] px-4 py-8 text-slate-900 dark:text-white sm:px-6 md:px-12 lg:px-16 transition-colors duration-200">
      <div className="mx-auto max-w-5xl">
        {/* Breadcrumb / Back button */}
        <Link
          to="/jobs"
          className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-500 transition-colors dark:text-cyan-400 dark:hover:text-cyan-300"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>← Back to jobs</span>
        </Link>

        {loading && (
          <div className="mt-8 flex items-center gap-3 text-slate-500 dark:text-slate-400">
            <span className="h-5 w-5 rounded-full border-2 border-blue-600 border-t-transparent animate-spin dark:border-cyan-400" />
            <p>Loading job details...</p>
          </div>
        )}

        {!loading && error && (
          <p role="alert" className="mt-8 rounded-2xl border border-rose-200 bg-rose-50 p-5 text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300">
            {error}
          </p>
        )}

        {!loading && job && (
          <div className="mt-6 space-y-8">
            {/* Header Card */}
            <header className="rounded-3xl border border-slate-200/80 bg-white p-6 md:p-10 shadow-xs backdrop-blur-xl dark:border-slate-800/90 dark:bg-slate-900/80 dark:shadow-2xl">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-blue-200/80 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 dark:border-cyan-500/20 dark:bg-cyan-500/10 dark:text-cyan-400 mb-3">
                    <Building2 className="h-3.5 w-3.5" />
                    <p className="text-sm font-medium text-blue-700 dark:text-cyan-400">{job.company}</p>
                  </div>

                  <h1 className="mt-1 text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                    {job.title}
                  </h1>

                  {/* Metadata Chips - EXACT SPANS FOR TEST COMPATIBILITY */}
                  <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                    <span className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1 dark:border-slate-800 dark:bg-slate-800/60">
                      <MapPin className="h-3.5 w-3.5 text-blue-600 dark:text-cyan-400" />
                      <span>{job.location}</span>
                    </span>

                    <span className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1 capitalize dark:border-slate-800 dark:bg-slate-800/60">
                      <Clock className="h-3.5 w-3.5 text-blue-600 dark:text-cyan-400" />
                      {job.workMode}
                    </span>

                    <span className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1 capitalize dark:border-slate-800 dark:bg-slate-800/60">
                      <Briefcase className="h-3.5 w-3.5 text-blue-600 dark:text-cyan-400" />
                      {job.employmentType?.replace("-", " ") || "full time"}
                    </span>

                    {job.experienceLevel && (
                      <span className="flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-1 text-indigo-700 capitalize dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-300">
                        <Sparkles className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                        {job.experienceLevel}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Skills Tags */}
              {job.skills?.length > 0 && (
                <div className="mt-6 border-t border-slate-100 dark:border-slate-800/80 pt-6">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
                    Desired Technical Skills
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {job.skills.map((skill) => (
                      <span
                        key={skill}
                        className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700 dark:border-slate-700/80 dark:bg-slate-800/80 dark:text-slate-200"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Deadline & Salary text compatibility */}
              <div className="mt-4 flex flex-wrap items-center gap-6 text-xs text-slate-500 dark:text-slate-400">
                {job.salary && (
                  <p className="text-slate-600 dark:text-slate-300">
                    Salary:{" "}
                    {job.salary.min != null || job.salary.max != null
                      ? `${job.salary.currency || "INR"} ${
                          job.salary.min ?? "—"
                        } – ${job.salary.max ?? "—"} / ${
                          job.salary.period || "year"
                        }`
                      : "Not specified"}
                  </p>
                )}

                {job.applicationDeadline && (
                  <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-slate-400" />
                    Deadline: {new Date(job.applicationDeadline).toLocaleDateString()}
                  </p>
                )}
              </div>
            </header>

            {/* Description & Responsibilities Section */}
            <section className="space-y-8 rounded-3xl border border-slate-200/80 bg-white p-6 md:p-10 shadow-xs backdrop-blur-xl dark:border-slate-800/90 dark:bg-slate-900/70">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-600 dark:text-cyan-400" />
                  Job description
                </h2>
                <p className="mt-4 whitespace-pre-wrap text-sm sm:text-base leading-relaxed text-slate-600 dark:text-slate-300">
                  {job.description}
                </p>
              </div>

              {job.responsibilities?.length > 0 && (
                <div className="border-t border-slate-100 dark:border-slate-800/80 pt-8">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">Responsibilities</h2>
                  <ul className="mt-4 list-disc space-y-2.5 pl-6 text-sm sm:text-base text-slate-600 dark:text-slate-300">
                    {job.responsibilities.map((item, index) => (
                      <li key={`${index}-${item}`}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}

              {job.requirements?.length > 0 && (
                <div className="border-t border-slate-100 dark:border-slate-800/80 pt-8">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">Requirements</h2>
                  <ul className="mt-4 list-disc space-y-2.5 pl-6 text-sm sm:text-base text-slate-600 dark:text-slate-300">
                    {job.requirements.map((item, index) => (
                      <li key={`${index}-${item}`}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
            </section>

            {/* Application Section */}
            <section className="rounded-3xl border border-blue-100 bg-white p-6 md:p-10 shadow-xs backdrop-blur-xl dark:border-cyan-500/30 dark:bg-slate-900/90 dark:shadow-2xl">
              <div className="flex items-center gap-2 text-blue-600 dark:text-cyan-400 mb-2">
                <Sparkles className="h-4 w-4" />
                <span className="text-xs uppercase font-bold tracking-wider">Fast Apply</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">Apply for this job</h2>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 max-w-2xl">
                Upload a PDF resume (maximum 5 MB). Your resume is kept private
                and shared only with you and the recruiter responsible for this job.
              </p>

              {!user && (
                <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center dark:border-slate-800 dark:bg-slate-950/60">
                  <p className="text-slate-600 dark:text-slate-300">
                    <Link to="/login" className="font-bold text-blue-600 hover:underline dark:text-cyan-400">
                      Sign in
                    </Link>{" "}
                    as a candidate to apply.
                  </p>
                </div>
              )}

              {user?.role === "recruiter" && (
                <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5 dark:border-amber-500/30 dark:bg-amber-500/10">
                  <p className="text-amber-800 dark:text-amber-300 font-medium">
                    Recruiter accounts cannot submit applications.
                  </p>
                </div>
              )}

              {user?.role === "candidate" && (
                <form onSubmit={handleApply} className="mt-8 space-y-6">
                  {/* Resume Upload Box */}
                  <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200">
                    Resume (PDF) *
                    <div className="mt-2 relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-6 transition-all hover:border-blue-400 focus-within:border-blue-500 dark:border-slate-700 dark:bg-slate-950/60 dark:hover:border-cyan-400/60 dark:focus-within:border-cyan-400">
                      <UploadCloud className="h-8 w-8 text-blue-600 dark:text-cyan-400 mb-2" />
                      <p className="text-xs text-slate-600 dark:text-slate-400 text-center">
                        <span className="font-semibold text-blue-600 dark:text-cyan-400">Click to browse</span> or drag and drop your PDF resume
                      </p>
                      <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">PDF format only (up to 5 MB)</p>
                      
                      <input
                        id="resume-upload"
                        type="file"
                        accept=".pdf,application/pdf"
                        onChange={handleResumeChange}
                        required
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      />
                    </div>

                    {resume && (
                      <div className="mt-3 flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-xs text-slate-700 dark:border-slate-800 dark:bg-slate-800/80 dark:text-slate-300">
                        <div className="flex items-center gap-2">
                          <FileCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                          <span className="font-medium text-slate-900 dark:text-white">{resume.name}</span>
                          <span className="text-slate-500">· {(resume.size / 1024).toFixed(0)} KB</span>
                        </div>
                        <button
                          type="button"
                          onClick={clearResume}
                          className="rounded p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-700 dark:hover:bg-slate-700 dark:hover:text-white"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )}
                  </label>

                  {/* Cover Letter Input */}
                  <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200">
                    Cover letter (optional)
                    <textarea
                      value={coverLetter}
                      onChange={(event) => setCoverLetter(event.target.value)}
                      maxLength={5000}
                      rows={5}
                      placeholder="Tell the recruiter why you're a great fit for this position..."
                      className="mt-2 w-full rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-900 placeholder-slate-400 shadow-xs focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-950/90 dark:text-white dark:placeholder-slate-500 dark:focus:border-cyan-400 dark:focus:ring-cyan-400/20"
                    />
                    <span className="mt-1 block text-right text-xs text-slate-400 dark:text-slate-500">
                      {coverLetter.length}/5000
                    </span>
                  </label>

                  {/* Feedback Messages */}
                  {applyError && (
                    <div role="alert" className="flex items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-700 text-sm dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300">
                      <AlertCircle className="h-5 w-5 text-rose-600 dark:text-rose-400 shrink-0" />
                      <span>{applyError}</span>
                    </div>
                  )}

                  {applyMessage && (
                    <div role="status" className="flex items-center justify-between gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-700 text-sm dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <span>{applyMessage}</span>
                      </div>
                      <Link to="/applications" className="font-bold underline text-emerald-700 hover:text-emerald-800 dark:text-emerald-300 dark:hover:text-emerald-200">
                        View applications
                      </Link>
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full sm:w-auto rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-3.5 font-bold text-white shadow-md shadow-blue-500/20 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 transition-all cursor-pointer dark:from-cyan-400 dark:to-blue-500 dark:text-slate-950 dark:shadow-cyan-400/20 dark:hover:from-cyan-300 dark:hover:to-blue-400"
                  >
                    {submitting ? "Submitting..." : "Submit application"}
                  </button>
                </form>
              )}
            </section>
          </div>
        )}
      </div>
    </main>
  );
}
