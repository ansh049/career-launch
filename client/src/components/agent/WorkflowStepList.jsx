import { useState } from "react";
import {
  CheckCircle2,
  AlertTriangle,
  Clock,
  Layers,
  ChevronDown,
  ChevronUp,
  Sparkles,
  ArrowRight
} from "lucide-react";

export default function WorkflowStepList({ steps = [] }) {
  const [expandedIndex, setExpandedIndex] = useState(null);

  if (!steps.length) {
    return (
      <div className="py-6 text-center text-xs text-slate-400">
        No workflow execution steps recorded yet.
      </div>
    );
  }

  function getStepTitle(tool) {
    switch (tool) {
      case "search_and_rank_jobs":
        return "1. Semantic Opportunity Discovery & Scoring";
      case "analyze_skill_gaps":
        return "2. Comparative Skill-Gap Analysis";
      case "generate_career_roadmap":
        return "3. Personalized Milestone & Practice Planning";
      case "tailor_resume":
        return "4. Evidence-Grounded Resume Tailoring";
      case "prepare_application_draft":
        return "5. Application Package Preparation (Approval Gate)";
      default:
        return tool.replace(/_/g, " ").toUpperCase();
    }
  }

  return (
    <div className="space-y-3">
      {steps.map((step, idx) => {
        const isDone = step.status === "completed";
        const isAwaiting = step.status === "awaiting_approval";
        const isExpanded = expandedIndex === idx;

        return (
          <div
            key={idx}
            className={`rounded-2xl border transition-all ${
              isAwaiting
                ? "border-amber-300 bg-amber-50/30 dark:border-amber-500/30 dark:bg-amber-950/20"
                : isDone
                ? "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/60"
                : "border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/40"
            }`}
          >
            <div
              onClick={() => setExpandedIndex(isExpanded ? null : idx)}
              className="flex items-center justify-between p-4 cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-xl text-xs font-bold ${
                    isDone
                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400"
                      : isAwaiting
                      ? "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300 animate-pulse"
                      : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                  }`}
                >
                  {isDone ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : isAwaiting ? (
                    <AlertTriangle className="h-4 w-4" />
                  ) : (
                    <span>{step.stepNumber}</span>
                  )}
                </div>

                <div>
                  <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                    {getStepTitle(step.tool)}
                  </h4>
                  <span className="text-[10px] text-slate-400">
                    Tool: <code className="font-mono">{step.tool}</code>
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                    isDone
                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400"
                      : isAwaiting
                      ? "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300"
                      : "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-400"
                  }`}
                >
                  {step.status.replace("_", " ")}
                </span>
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4 text-slate-400" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-slate-400" />
                )}
              </div>
            </div>

            {/* Expanded JSON Inspector */}
            {isExpanded && (
              <div className="p-4 pt-0 border-t border-slate-100 dark:border-slate-800/80 mt-2 space-y-2 text-xs font-mono animate-fadeIn">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950/60 overflow-x-auto">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Output Summary Payload:
                  </span>
                  <pre className="text-[11px] text-slate-700 dark:text-slate-300">
                    {JSON.stringify(step.outputPayload, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
