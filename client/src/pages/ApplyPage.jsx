import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  UploadCloud,
  FileCheck,
  ArrowLeft,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Send,
  X
} from "lucide-react";
import api from "../services/api";

const MAX_RESUME_SIZE = 5 * 1024 * 1024;

export default function ApplyPage() {
  const { id: jobId } = useParams();
  const [resume, setResume] = useState(null);
  const [coverLetter, setCoverLetter] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submitApplication(event) {
    event.preventDefault();

    if (
      !resume ||
      resume.type !== "application/pdf" ||
      !resume.name.toLowerCase().endsWith(".pdf")
    ) {
      setMessage("Select a PDF resume.");
      return;
    }

    if (resume.size > MAX_RESUME_SIZE) {
      setMessage("Resume must be 5 MB or smaller.");
      return;
    }

    const form = new FormData();
    form.append("resume", resume);
    form.append("coverLetter", coverLetter);

    try {
      setSubmitting(true);
      const response = await api.post(
        `/api/jobs/${jobId}/applications`,
        form,
      );
      setMessage(response.data.message);
    } catch (error) {
      setMessage(error.response?.data?.message || "Application failed.");
    } finally {
      setSubmitting(false);
    }
  }

  function handleFileChange(event) {
    const file = event.target.files?.[0] || null;
    setResume(file);
    setMessage("");
  }

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-[#090D16] px-4 py-12 text-slate-900 dark:text-white sm:px-6 md:px-12 transition-colors">
      <div className="mx-auto max-w-xl">
        <Link
          to={`/jobs/${jobId}`}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 dark:text-cyan-400 hover:text-blue-500 dark:hover:text-cyan-300 transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>← Back to job details</span>
        </Link>

        <form
          onSubmit={submitApplication}
          className="space-y-6 rounded-3xl border border-slate-200 dark:border-slate-800/90 bg-white/90 dark:bg-slate-900/80 p-8 sm:p-10 shadow-xl dark:shadow-2xl backdrop-blur-2xl transition-colors"
        >
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/20 dark:border-cyan-500/20 bg-blue-50 dark:bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-blue-700 dark:text-cyan-400 mb-2">
              <Sparkles className="h-3 w-3" />
              <span>Direct Submission</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Apply for this opportunity
            </h1>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Submit your credentials directly to the hiring team.
            </p>
          </div>

          {/* Resume Upload */}
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">
            <span className="mb-2 block">Resume (PDF, up to 5 MB)</span>
            <div className="relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-950/60 p-6 transition-all hover:border-blue-500 dark:hover:border-cyan-400/60">
              <UploadCloud className="h-8 w-8 text-blue-600 dark:text-cyan-400 mb-2" />
              <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
                <span className="font-semibold text-blue-600 dark:text-cyan-400">Choose PDF file</span> or drag & drop here
              </p>
              <input
                type="file"
                accept=".pdf,application/pdf"
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
            </div>

            {resume && (
              <div className="mt-3 flex items-center justify-between rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 px-4 py-2 text-xs text-slate-700 dark:text-slate-300">
                <div className="flex items-center gap-2">
                  <FileCheck className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />
                  <span className="font-medium text-slate-900 dark:text-white">{resume.name}</span>
                  <span className="text-slate-500">· {(resume.size / 1024).toFixed(0)} KB</span>
                </div>
                <button
                  type="button"
                  onClick={() => setResume(null)}
                  className="rounded p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
          </label>

          {/* Cover Letter */}
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">
            <span className="mb-2 block">Cover letter (optional)</span>
            <textarea
              value={coverLetter}
              onChange={(event) => setCoverLetter(event.target.value)}
              maxLength={5000}
              rows={6}
              placeholder="Highlight your relevant experience and excitement for this role..."
              className="w-full rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-950/90 p-4 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-blue-500 dark:focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-cyan-400/20"
            />
            <span className="mt-1 block text-right text-xs text-slate-400 dark:text-slate-500">
              {coverLetter.length}/5000
            </span>
          </label>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-cyan-400 dark:to-blue-500 px-6 py-3.5 font-bold text-white dark:text-slate-950 shadow-md shadow-blue-500/20 dark:shadow-cyan-400/20 hover:from-blue-500 hover:to-indigo-500 dark:hover:from-cyan-300 dark:hover:to-blue-400 disabled:opacity-50 transition-all text-sm cursor-pointer"
          >
            <Send className="h-4 w-4" />
            <span>{submitting ? "Submitting..." : "Submit application"}</span>
          </button>

          {/* Status Message */}
          {message && (
            <p
              role="status"
              className={`rounded-2xl border p-4 text-sm flex items-center justify-between gap-3 ${
                message.includes("success")
                  ? "border-emerald-300 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-800 dark:text-emerald-300"
                  : "border-blue-300 dark:border-cyan-500/30 bg-blue-50 dark:bg-cyan-500/10 text-blue-800 dark:text-cyan-300"
              }`}
            >
              <span>{message}</span>
              {message === "Application submitted successfully." && (
                <Link to="/applications" className="font-bold underline text-blue-700 dark:text-white hover:text-blue-900 dark:hover:text-cyan-200">
                  View applications
                </Link>
              )}
            </p>
          )}
        </form>
      </div>
    </main>
  );
}