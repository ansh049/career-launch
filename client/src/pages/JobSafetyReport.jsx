import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ShieldAlert, AlertTriangle, Flag, ArrowLeft, Send, RefreshCw } from "lucide-react";
import api from "../services/api";

const REPORT_REASONS = [
  "Requests payment or fees to apply",
  "Impersonation of a known company",
  "Unrealistic salary or benefits",
  "Suspicious or vague job description",
  "Duplicate or spam listing",
  "Other",
];

export default function JobSafetyReport() {
  const { jobId } = useParams();
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [riskSummary, setRiskSummary] = useState(null);
  const [loadingRisk, setLoadingRisk] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!reason) return;
    setSubmitting(true);
    setError("");
    try {
      await api.post(`/api/jobs/${jobId}/report`, { reason, details });
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit report.");
    } finally {
      setSubmitting(false);
    }
  }

  async function loadRiskSummary() {
    setLoadingRisk(true);
    try {
      const res = await api.get(`/api/jobs/${jobId}/risk-summary`);
      setRiskSummary(res.data?.riskSummary || null);
    } catch {
      setRiskSummary(null);
    } finally {
      setLoadingRisk(false);
    }
  }

  const riskColors = { low: "emerald", medium: "amber", high: "orange", critical: "rose" };
  const riskColor = riskSummary ? riskColors[riskSummary.riskLevel] || "slate" : "slate";

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-[#090D16] px-4 py-10 text-slate-900 dark:text-white sm:px-6 md:px-12 lg:px-16 transition-colors duration-200">
      <div className="mx-auto max-w-2xl">
        <Link to={`/jobs/${jobId}`} className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-500 dark:text-cyan-400 mb-6">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Job
        </Link>

        <div className="border-b border-slate-200 dark:border-slate-800/80 pb-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-rose-200/80 bg-rose-50 px-3.5 py-1 text-xs font-semibold text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-400 mb-3">
            <ShieldAlert className="h-3.5 w-3.5" />
            <span>Job Safety Report</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">Report Suspicious Listing</h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Help keep our platform safe. Reports are reviewed by our moderation team.
          </p>
        </div>

        {/* AI Risk Summary */}
        <div className="mt-6">
          {!riskSummary && (
            <button type="button" onClick={loadRiskSummary} disabled={loadingRisk}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 cursor-pointer">
              {loadingRisk ? <RefreshCw className="h-4 w-4 animate-spin" /> : <AlertTriangle className="h-4 w-4" />}
              <span>View AI Safety Assessment</span>
            </button>
          )}

          {riskSummary && (
            <div className={`rounded-2xl border p-4 bg-${riskColor}-50/60 border-${riskColor}-200 dark:bg-${riskColor}-500/10 dark:border-${riskColor}-500/30`}>
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-xs font-bold uppercase tracking-wider">AI Risk Level: {riskSummary.riskLevel}</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                {riskSummary.flagCount} indicator(s) detected · {riskSummary.reportCount} user report(s)
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-500 mt-1 italic">{riskSummary.note}</p>
            </div>
          )}
        </div>

        {submitted ? (
          <div className="mt-8 rounded-3xl border border-emerald-200 bg-emerald-50 p-8 text-center dark:border-emerald-500/30 dark:bg-emerald-500/10">
            <Flag className="h-8 w-8 text-emerald-600 dark:text-emerald-400 mx-auto mb-3" />
            <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">Report Submitted</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">Thank you. Our moderation team will review this listing.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Reason for Report</label>
              <div className="space-y-2">
                {REPORT_REASONS.map((r) => (
                  <label key={r} className="flex items-center gap-2.5 cursor-pointer">
                    <input type="radio" name="reason" value={r} checked={reason === r} onChange={() => setReason(r)}
                      className="h-4 w-4 text-blue-600 border-slate-300 focus:ring-blue-500" />
                    <span className="text-sm text-slate-700 dark:text-slate-300">{r}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Additional Details (optional)</label>
              <textarea rows={3} value={details} onChange={(e) => setDetails(e.target.value)} placeholder="Provide any additional context..."
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 p-3 text-sm text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800/80 dark:text-white" />
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-600 dark:text-rose-400">{error}</div>
            )}

            <div className="flex justify-end">
              <button type="submit" disabled={submitting || !reason}
                className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-rose-500 disabled:opacity-50 cursor-pointer">
                {submitting ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                <span>Submit Report</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </main>
  );
}
