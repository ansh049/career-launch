import { AlertCircle, CheckCircle2, Clock, Sparkles, Tag, ArrowUpRight } from "lucide-react";

export default function SkillGapList({ analysis, loading }) {
  if (loading) {
    return (
      <div className="py-8 text-center text-xs text-slate-500 dark:text-slate-400">
        <span className="h-6 w-6 rounded-full border-2 border-blue-600 border-t-transparent animate-spin inline-block mr-2 align-middle dark:border-cyan-400" />
        Analyzing your skill profile against target requirements...
      </div>
    );
  }

  if (!analysis) return null;

  const {
    target_role,
    matched_skills = [],
    critical_gaps = [],
    recommended_gaps = [],
    match_percentage = 0,
    readiness_level = "Developing",
  } = analysis;

  return (
    <div className="space-y-6">
      {/* Overview Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900/60">
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Target Role</span>
          <p className="mt-1 font-bold text-sm text-slate-900 dark:text-white truncate">{target_role}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900/60">
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Skill Coverage</span>
          <p className="mt-1 font-extrabold text-base text-blue-600 dark:text-cyan-400">{match_percentage}%</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900/60">
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Critical Gaps</span>
          <p className="mt-1 font-extrabold text-base text-rose-600 dark:text-rose-400">{critical_gaps.length}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900/60">
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Readiness Level</span>
          <p className="mt-1 font-bold text-xs text-emerald-600 dark:text-emerald-400 truncate">{readiness_level}</p>
        </div>
      </div>

      {/* Matched Skills */}
      {matched_skills.length > 0 && (
        <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/50 p-5 dark:border-emerald-500/20 dark:bg-emerald-950/20">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <h3 className="text-xs font-bold text-emerald-900 dark:text-emerald-300">
              Matched Competencies ({matched_skills.length})
            </h3>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {matched_skills.map((skill) => (
              <span
                key={skill}
                className="rounded-lg border border-emerald-200 bg-white px-2.5 py-1 text-xs font-semibold text-emerald-800 capitalize dark:border-emerald-500/30 dark:bg-emerald-900/30 dark:text-emerald-200"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Critical Gaps Section */}
      {critical_gaps.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-extrabold text-rose-700 dark:text-rose-400 flex items-center gap-1.5 uppercase tracking-wider">
            <AlertCircle className="h-3.5 w-3.5" />
            <span>High Priority / Critical Skill Gaps</span>
          </h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {critical_gaps.map((gap) => (
              <div
                key={gap.skill}
                className="rounded-2xl border border-rose-200/80 bg-rose-50/40 p-4 dark:border-rose-500/20 dark:bg-rose-950/20 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-bold text-sm text-slate-900 dark:text-white capitalize">
                      {gap.skill}
                    </span>
                    <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-700 dark:bg-rose-500/20 dark:text-rose-300">
                      Critical
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {gap.reason || "Essential requirement for standard job postings in this domain."}
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-rose-200/40 dark:border-rose-900/40 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1">
                    <Tag className="h-3 w-3 text-rose-500" />
                    <span>{gap.category}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3 text-slate-400" />
                    <span>~{gap.estimated_hours} hrs</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommended Gaps Section */}
      {recommended_gaps.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-extrabold text-amber-700 dark:text-amber-400 flex items-center gap-1.5 uppercase tracking-wider">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Recommended / Competitive Advantage Skills</span>
          </h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {recommended_gaps.map((gap) => (
              <div
                key={gap.skill}
                className="rounded-2xl border border-amber-200/80 bg-amber-50/40 p-4 dark:border-amber-500/20 dark:bg-amber-950/20 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-bold text-sm text-slate-900 dark:text-white capitalize">
                      {gap.skill}
                    </span>
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:bg-amber-500/20 dark:text-amber-300">
                      Recommended
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {gap.reason || "High-demand complementary tooling that distinguishes top applicants."}
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-amber-200/40 dark:border-amber-900/40 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1">
                    <Tag className="h-3 w-3 text-amber-500" />
                    <span>{gap.category}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3 text-slate-400" />
                    <span>~{gap.estimated_hours} hrs</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
