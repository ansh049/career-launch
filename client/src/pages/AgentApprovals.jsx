import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ShieldAlert,
  CheckCircle2,
  RefreshCw,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Compass
} from "lucide-react";
import api from "../services/api";
import ApprovalCard from "../components/agent/ApprovalCard";

export default function AgentApprovals() {
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [decidingId, setDecidingId] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let active = true;

    async function loadApprovals() {
      try {
        const res = await api.get("/api/agent/approvals");
        if (active) setApprovals(res.data?.approvals || []);
      } catch {
        if (active) setError("Failed to load approval requests.");
      } finally {
        if (active) setLoading(false);
      }
    }

    loadApprovals();
    return () => {
      active = false;
    };
  }, []);

  async function handleDecision(approvalId, decision, notes) {
    setDecidingId(approvalId);
    setError("");

    try {
      await api.post(`/api/agent/approvals/${approvalId}/decision`, {
        decision,
        notes,
      });

      setApprovals((prev) => prev.filter((a) => a._id !== approvalId));
      setNotice(
        `Action successfully ${decision === "approved" ? "authorized and executed" : "declined"}.`
      );
      setTimeout(() => setNotice(""), 4000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit approval decision.");
    } finally {
      setDecidingId(null);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-[#090D16] px-4 py-10 text-slate-900 dark:text-white sm:px-6 md:px-12 lg:px-16 transition-colors duration-200">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="border-b border-slate-200 dark:border-slate-800/80 pb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-300 bg-amber-50 px-3.5 py-1 text-xs font-semibold text-amber-800 dark:border-amber-500/30 dark:bg-amber-950/40 dark:text-amber-300 mb-3">
                <ShieldAlert className="h-3.5 w-3.5" />
                <span>Human-in-the-Loop Safe Approval Queue</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                Pending Action Approvals
              </h1>
              <p className="mt-2 text-sm sm:text-base text-slate-600 dark:text-slate-400">
                The Career Assistant never applies for jobs, shares resumes, or executes external changes without your explicit authorization.
              </p>
            </div>

            <Link
              to="/assistant"
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              <span>Back to Assistant</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {notice && (
            <div className="mt-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              {notice}
            </div>
          )}

          {error && (
            <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-600 dark:text-rose-400 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Approvals List */}
        <div className="mt-8 space-y-6">
          {loading ? (
            <div className="py-12 flex justify-center text-slate-400 text-xs">
              <RefreshCw className="h-6 w-6 animate-spin text-blue-600 dark:text-cyan-400" />
            </div>
          ) : approvals.length === 0 ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center max-w-md mx-auto shadow-xs dark:border-slate-800 dark:bg-slate-900/60">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 mb-4 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20">
                <ShieldCheck className="h-7 w-7" />
              </div>
              <h3 className="font-extrabold text-slate-900 text-base dark:text-white">
                Queue Clear — No Pending Approvals
              </h3>
              <p className="text-slate-500 text-xs mt-2 dark:text-slate-400">
                Any consequential actions staged by your Career Assistant will appear here for review and explicit approval.
              </p>
              <Link
                to="/assistant"
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2 text-xs font-bold text-white hover:bg-blue-500 dark:bg-cyan-400 dark:text-slate-950"
              >
                <span>Launch Assistant Session</span>
              </Link>
            </div>
          ) : (
            approvals.map((approval) => (
              <ApprovalCard
                key={approval._id}
                approval={approval}
                onDecision={handleDecision}
                deciding={decidingId === approval._id}
              />
            ))
          )}
        </div>
      </div>
    </main>
  );
}
