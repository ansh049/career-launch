import { useState } from "react";
import {
  Check,
  X,
  Edit3,
  Sparkles,
  ArrowRight,
  TrendingUp,
  AlertCircle
} from "lucide-react";

export default function ResumeSuggestionEditor({
  suggestion,
  onUpdateStatus,
  updating,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(
    suggestion.editedText || suggestion.suggestedText
  );

  const isAccepted = suggestion.status === "accepted";
  const isRejected = suggestion.status === "rejected";
  const isCustomEdited = suggestion.status === "edited";

  const handleSaveEdit = () => {
    onUpdateStatus(suggestion.id, "edited", editedText);
    setIsEditing(false);
  };

  return (
    <div
      className={`rounded-2xl border p-5 transition-all ${
        isAccepted || isCustomEdited
          ? "border-emerald-200 bg-emerald-50/20 dark:border-emerald-500/20 dark:bg-emerald-950/10"
          : isRejected
          ? "border-slate-200 bg-slate-50/50 opacity-60 dark:border-slate-800 dark:bg-slate-900/30"
          : "border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900/70"
      }`}
    >
      {/* Header with Section, Impact Factor, and Status */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-700 dark:bg-slate-800 dark:text-slate-300">
            {suggestion.section}
          </span>
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
              suggestion.impactFactor === "High"
                ? "bg-blue-100 text-blue-700 dark:bg-cyan-500/20 dark:text-cyan-400"
                : "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300"
            }`}
          >
            {suggestion.impactFactor} Impact
          </span>
        </div>

        {/* Current State Badge */}
        <span
          className={`text-[11px] font-bold capitalize ${
            isAccepted
              ? "text-emerald-600 dark:text-emerald-400"
              : isCustomEdited
              ? "text-blue-600 dark:text-cyan-400"
              : isRejected
              ? "text-rose-600 dark:text-rose-400"
              : "text-slate-400"
          }`}
        >
          {suggestion.status}
        </span>
      </div>

      {/* Comparison Grid: Original vs Suggested */}
      <div className="grid gap-3 sm:grid-cols-2 text-xs">
        {/* Original */}
        <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-3 dark:border-slate-800 dark:bg-slate-950/50">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Current / Source Resume
          </span>
          <p className="text-slate-600 dark:text-slate-400 line-through leading-relaxed">
            {suggestion.originalText}
          </p>
        </div>

        {/* Suggested or Custom Edited */}
        <div className="rounded-xl border border-blue-200 bg-blue-50/30 p-3 dark:border-cyan-500/30 dark:bg-cyan-950/20">
          <span className="text-[10px] font-bold text-blue-600 dark:text-cyan-400 uppercase tracking-wider block mb-1">
            Tailored Grounded Improvement
          </span>
          {isEditing ? (
            <div className="space-y-2">
              <textarea
                value={editedText}
                onChange={(e) => setEditedText(e.target.value)}
                rows={3}
                className="w-full rounded-lg border border-blue-300 bg-white p-2 text-xs text-slate-900 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              />
              <div className="flex justify-end gap-1.5">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="rounded-lg px-2.5 py-1 text-[11px] text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveEdit}
                  className="rounded-lg bg-blue-600 px-3 py-1 text-[11px] font-bold text-white hover:bg-blue-500 dark:bg-cyan-400 dark:text-slate-950"
                >
                  Save Edit
                </button>
              </div>
            </div>
          ) : (
            <p className="text-slate-900 dark:text-white font-medium leading-relaxed">
              {suggestion.editedText || suggestion.suggestedText}
            </p>
          )}
        </div>
      </div>

      {/* Rationale explanation */}
      {suggestion.reason && (
        <p className="mt-3 text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
          <Sparkles className="h-3 w-3 text-blue-500 dark:text-cyan-400 shrink-0" />
          <span>{suggestion.reason}</span>
        </p>
      )}

      {/* Action Controls */}
      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-end gap-2">
        <button
          type="button"
          disabled={updating}
          onClick={() => setIsEditing(!isEditing)}
          className="inline-flex items-center gap-1 rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 cursor-pointer"
        >
          <Edit3 className="h-3.5 w-3.5" />
          <span>Edit</span>
        </button>

        <button
          type="button"
          disabled={updating}
          onClick={() => onUpdateStatus(suggestion.id, "rejected")}
          className={`inline-flex items-center gap-1 rounded-xl border px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
            isRejected
              ? "border-rose-400 bg-rose-50 text-rose-700 dark:border-rose-500 dark:bg-rose-950/30 dark:text-rose-300"
              : "border-slate-200 text-slate-600 hover:bg-rose-50 hover:text-rose-600 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800"
          }`}
        >
          <X className="h-3.5 w-3.5" />
          <span>Reject</span>
        </button>

        <button
          type="button"
          disabled={updating}
          onClick={() => onUpdateStatus(suggestion.id, "accepted")}
          className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-1.5 text-xs font-bold transition-all cursor-pointer ${
            isAccepted
              ? "bg-emerald-600 text-white shadow-xs dark:bg-emerald-500 dark:text-slate-950"
              : "bg-blue-600 text-white hover:bg-blue-500 dark:bg-cyan-400 dark:text-slate-950 dark:hover:bg-cyan-300"
          }`}
        >
          <Check className="h-3.5 w-3.5" />
          <span>{isAccepted ? "Accepted" : "Accept Suggestion"}</span>
        </button>
      </div>
    </div>
  );
}
