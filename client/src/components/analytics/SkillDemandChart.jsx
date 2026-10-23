import React from "react";
import { Sparkles, TrendingUp } from "lucide-react";

export default function SkillDemandChart({ topSkills = [], totalJobs = 0, title = "High-Demand Skills" }) {
  const maxCount = topSkills.length > 0 ? Math.max(...topSkills.map((s) => s.count || 1)) : 1;

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900/70">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">{title}</h3>
            <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="h-3 w-3" /> Live
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Frequency in published postings ({totalJobs} postings indexed)
          </p>
        </div>
      </div>

      {topSkills.length === 0 ? (
        <div className="py-12 text-center text-sm text-slate-400">
          No skill demand data available for this criteria.
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {topSkills.slice(0, 8).map((item, index) => {
            const barWidth = Math.max(8, Math.round((item.count / maxCount) * 100));
            const pctOfJobs = totalJobs > 0 ? Math.round((item.count / totalJobs) * 100) : 0;

            return (
              <div key={item.skill || index} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold capitalize text-slate-800 dark:text-slate-200">
                    {item.skill}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-slate-600 dark:text-slate-300">
                      {item.count} job{item.count !== 1 ? "s" : ""}
                    </span>
                    <span className="text-[11px] text-slate-400 dark:text-slate-500">
                      ({pctOfJobs}% demand)
                    </span>
                  </div>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-blue-600 to-indigo-500 transition-all duration-500 dark:from-cyan-500 dark:to-blue-600"
                    style={{ width: `${barWidth}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
