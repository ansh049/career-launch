import { useEffect, useState } from "react";
import { ShieldCheck, ShieldAlert, AlertTriangle, CheckCircle2, RefreshCw, XCircle, Eye } from "lucide-react";
import api from "../services/api";

export default function ModerationQueue() {
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [decidingId, setDecidingId] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get("/api/moderation/jobs/flagged");
        setAssessments(res.data?.assessments || []);
      } catch {
        setError("Failed to load moderation queue.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function handleDecision(jobId, decision) {
    setDecidingId(jobId);
    try {
      await api.post(`/api/moderation/jobs/${jobId}/review`, { decision, notes: "" });
      setAssessments((prev) => prev.filter((a) => String(a.jobId?._id || a.jobId) !== String(jobId)));
      setNotice(`Decision recorded: ${decision}`);
      setTimeout(() => setNotice(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit decision.");
    } finally {
      setDecidingId(null);
    }
  }

  const riskBadge = (level) => {
    const colors = { low: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400", medium: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400", high: "bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-400", critical: "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-400" };
    return colors[level] || colors.low;
  };

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-[#090D16] px-4 py-10 text-slate-900 dark:text-white sm:px-6 md:px-12 lg:px-16 transition-colors duration-200">
      <div className="mx-auto max-w-5xl">
        <div className="border-b border-slate-200 dark:border-slate-800/80 pb-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-300 bg-amber-50 px-3.5 py-1 text-xs font-semibold text-amber-800 dark:border-amber-500/30 dark:bg-amber-950/40 dark:text-amber-300 mb-3">
            <ShieldAlert className="h-3.5 w-3.5" />
            <span>Admin Moderation Queue</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Flagged Job Listings</h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Review AI-flagged and user-reported job listings. Every flag includes supporting evidence.</p>
        </div>

        {notice && <div className="mt-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs font-semibold text-emerald-600 dark:text-emerald-400">{notice}</div>}
        {error && <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-600 dark:text-rose-400">{error}</div>}

        <div className="mt-8 space-y-4">
          {loading ? (
            <div className="py-12 flex justify-center"><RefreshCw className="h-6 w-6 animate-spin text-blue-600 dark:text-cyan-400" /></div>
          ) : assessments.length === 0 ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center dark:border-slate-800 dark:bg-slate-900/60">
              <ShieldCheck className="h-10 w-10 text-emerald-600 dark:text-emerald-400 mx-auto mb-3" />
              <h3 className="font-extrabold text-base dark:text-white">Queue Clear</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">No flagged listings require review.</p>
            </div>
          ) : (
            assessments.map((a) => {
              const job = a.jobId || {};
              const id = job._id || a.jobId;
              return (
                <div key={a._id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900/60">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${riskBadge(a.riskLevel)}`}>{a.riskLevel}</span>
                        <span className="text-[10px] text-slate-400">{a.reportCount} report(s)</span>
                      </div>
                      <h3 className="font-bold text-base text-slate-900 dark:text-white">{job.title || "Unknown Job"}</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{job.company || ""}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button type="button" onClick={() => handleDecision(id, "reviewed_safe")} disabled={decidingId === id}
                        className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-500 cursor-pointer">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Safe
                      </button>
                      <button type="button" onClick={() => handleDecision(id, "reviewed_fraudulent")} disabled={decidingId === id}
                        className="inline-flex items-center gap-1 rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-rose-500 cursor-pointer">
                        <XCircle className="h-3.5 w-3.5" /> Fraudulent
                      </button>
                      <button type="button" onClick={() => handleDecision(id, "escalated")} disabled={decidingId === id}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 cursor-pointer">
                        <Eye className="h-3.5 w-3.5" /> Escalate
                      </button>
                    </div>
                  </div>
                  {a.indicators?.length > 0 && (
                    <div className="mt-3 space-y-1.5">
                      <p className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider">Risk Indicators</p>
                      {a.indicators.map((ind, i) => (
                        <div key={i} className="flex items-start gap-2 text-xs">
                          <AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" />
                          <span className="text-slate-700 dark:text-slate-300">{ind.signal} <span className="text-slate-400">(confidence: {Math.round(ind.confidence * 100)}%)</span></span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </main>
  );
}
