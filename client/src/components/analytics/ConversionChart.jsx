import React from "react";

export default function ConversionChart({ byStatus = {}, total = 0, title = "Pipeline Conversion" }) {
  const stages = [
    { key: "applied", label: "Applied", color: "bg-blue-500", textColor: "text-blue-500" },
    { key: "reviewing", label: "Under Review", color: "bg-amber-500", textColor: "text-amber-500" },
    { key: "shortlisted", label: "Shortlisted", color: "bg-indigo-500", textColor: "text-indigo-500" },
    { key: "accepted", label: "Accepted", color: "bg-emerald-500", textColor: "text-emerald-500" },
    { key: "rejected", label: "Not Selected", color: "bg-rose-500", textColor: "text-rose-500" },
  ];

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900/70">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">{title}</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Application funnel stage breakdown</p>
        </div>
        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 dark:bg-cyan-500/10 dark:text-cyan-300">
          {total} Total
        </span>
      </div>

      <div className="mt-6 space-y-4">
        {stages.map((stage) => {
          const count = byStatus[stage.key] || 0;
          const percentage = total > 0 ? Math.round((count / total) * 100) : 0;

          return (
            <div key={stage.key} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-slate-700 dark:text-slate-300">{stage.label}</span>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-900 dark:text-white">{count}</span>
                  <span className="text-slate-400">({percentage}%)</span>
                </div>
              </div>
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${stage.color}`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
