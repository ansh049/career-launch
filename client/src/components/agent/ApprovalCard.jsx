import { useState } from "react";
import {
  ShieldAlert,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  Building2,
  FileText,
  AlertTriangle
} from "lucide-react";

export default function ApprovalCard({ approval, onDecision, deciding }) {
  const [notes, setNotes] = useState("");
  const [showPayload, setShowPayload] = useState(false);

  return (
    <div className="rounded-3xl border border-amber-300/80 bg-amber-50/20 p-6 shadow-sm backdrop-blur-md dark:border-amber-500/30 dark:bg-amber-950/20">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300 shrink-0">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-amber-800 dark:bg-amber-500/20 dark:text-amber-300">
              Human-in-the-Loop Sign-Off
            </span>
            <h3 className="mt-1 text-base font-bold text-slate-900 dark:text-white">
              {approval.title}
            </h3>
          </div>
        </div>

        <span className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 shrink-0">
          <Clock className="h-3.5 w-3.5" />
          <span>Expires in 24h</span>
        </span>
      </div>

      <p className="mt-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
        {approval.description}
      </p>

      {/* Payload Inspection Preview */}
      {approval.payload && (
        <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 text-xs dark:border-slate-800 dark:bg-slate-950/60">
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5 text-blue-500 dark:text-cyan-400" />
              <span>Prepared Action Payload Details</span>
            </span>
            <button
              type="button"
              onClick={() => setShowPayload(!showPayload)}
              className="text-[11px] font-semibold text-blue-600 dark:text-cyan-400 hover:underline"
            >
              {showPayload ? "Hide Details" : "Inspect Raw Details"}
            </button>
          </div>

          <div className="space-y-1.5 text-slate-600 dark:text-slate-400">
            {approval.payload.job_title && (
              <p>
                <strong>Position:</strong> {approval.payload.job_title}
              </p>
            )}
            {approval.payload.company && (
              <p>
                <strong>Target Employer:</strong> {approval.payload.company}
              </p>
            )}
            {approval.payload.cover_note && (
              <div className="mt-2 rounded-xl bg-slate-50 p-3 text-[11px] font-mono whitespace-pre-wrap dark:bg-slate-900 text-slate-800 dark:text-slate-200">
                {approval.payload.cover_note}
              </div>
            )}
            {showPayload && (
              <pre className="mt-2 rounded-xl bg-slate-100 p-3 text-[10px] font-mono overflow-x-auto dark:bg-slate-900">
                {JSON.stringify(approval.payload, null, 2)}
              </pre>
            )}
          </div>
        </div>
      )}

      {/* Decision Controls */}
      <div className="mt-5 pt-4 border-t border-amber-200/50 dark:border-amber-900/50 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <input
          type="text"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Optional notes or feedback..."
          className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
        />

        <div className="flex items-center gap-2 justify-end">
          <button
            type="button"
            disabled={deciding}
            onClick={() => onDecision(approval._id, "rejected", notes)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 cursor-pointer disabled:opacity-50"
          >
            <XCircle className="h-4 w-4" />
            <span>Decline / Cancel</span>
          </button>

          <button
            type="button"
            disabled={deciding}
            onClick={() => onDecision(approval._id, "approved", notes)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-2 text-xs font-bold text-white shadow-sm shadow-emerald-500/20 hover:from-emerald-500 hover:to-teal-500 dark:from-emerald-500 dark:to-teal-500 dark:text-slate-950 cursor-pointer disabled:opacity-50"
          >
            <CheckCircle2 className="h-4 w-4" />
            <span>Approve & Authorize</span>
          </button>
        </div>
      </div>
    </div>
  );
}
