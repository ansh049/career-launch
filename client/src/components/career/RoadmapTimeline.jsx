import {
  CheckCircle2,
  Clock,
  ExternalLink,
  BookOpen,
  FolderGit2,
  Check,
  ChevronRight,
  ArrowRight,
  Sparkles,
  Layers,
  Circle
} from "lucide-react";

export default function RoadmapTimeline({ milestones = [], onUpdateStatus, updatingId }) {
  if (!milestones.length) {
    return (
      <div className="py-8 text-center text-xs text-slate-500 dark:text-slate-400">
        No milestones generated yet. Select a target role to generate a learning path.
      </div>
    );
  }

  return (
    <div className="relative space-y-8 before:absolute before:inset-0 before:left-4 sm:before:left-6 before:h-full before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
      {milestones.map((milestone, index) => {
        const isCompleted = milestone.status === "completed";
        const isInProgress = milestone.status === "in_progress";

        return (
          <div key={milestone.id || index} className="relative flex items-start gap-4 sm:gap-6">
            {/* Status Icon Badge */}
            <div
              className={`relative z-10 flex h-9 w-9 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-2xl border transition-all ${
                isCompleted
                  ? "border-emerald-500 bg-emerald-500 text-white shadow-md shadow-emerald-500/20"
                  : isInProgress
                  ? "border-blue-500 bg-blue-50 text-blue-600 dark:border-cyan-400 dark:bg-cyan-500/20 dark:text-cyan-300 ring-4 ring-blue-500/10 dark:ring-cyan-500/20 animate-pulse"
                  : "border-slate-300 bg-white text-slate-400 dark:border-slate-700 dark:bg-slate-900"
              }`}
            >
              {isCompleted ? (
                <Check className="h-5 w-5 stroke-[2.5]" />
              ) : isInProgress ? (
                <Sparkles className="h-5 w-5" />
              ) : (
                <Circle className="h-4 w-4" />
              )}
            </div>

            {/* Milestone Card */}
            <div
              className={`flex-1 rounded-3xl border bg-white p-5 sm:p-7 shadow-xs backdrop-blur-md transition-all ${
                isCompleted
                  ? "border-emerald-200 bg-emerald-50/20 dark:border-emerald-500/20 dark:bg-emerald-950/10"
                  : isInProgress
                  ? "border-blue-300 ring-1 ring-blue-300 dark:border-cyan-500/40 dark:ring-cyan-500/20 dark:bg-slate-900/80"
                  : "border-slate-200/90 dark:border-slate-800/90 dark:bg-slate-900/60"
              }`}
            >
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                      {milestone.phase || `Phase ${index + 1}`}
                    </span>
                    <span className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">
                      <Clock className="h-3 w-3" />
                      <span>~{milestone.estimatedHours || 25} hours</span>
                    </span>
                  </div>
                  <h3 className="mt-1.5 text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                    {milestone.title}
                  </h3>
                </div>

                {/* Status Selector */}
                <div className="flex items-center gap-1.5 self-start sm:self-center">
                  <select
                    value={milestone.status}
                    disabled={updatingId === milestone.id}
                    onChange={(e) => onUpdateStatus(milestone.id, e.target.value)}
                    className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-xs focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 cursor-pointer"
                  >
                    <option value="not_started">To Do</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <p className="mt-2.5 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {milestone.description}
              </p>

              {/* Focus Skills */}
              {milestone.skills?.length > 0 && (
                <div className="mt-4 flex flex-wrap items-center gap-1.5">
                  <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mr-1">
                    Key Topics:
                  </span>
                  {milestone.skills.map((skill) => (
                    <span
                      key={skill}
                      className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-semibold text-slate-700 capitalize dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-300"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              )}

              {/* Learning Resources */}
              {milestone.resources?.length > 0 && (
                <div className="mt-5 border-t border-slate-100 dark:border-slate-800/80 pt-4">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5 mb-2.5">
                    <BookOpen className="h-3.5 w-3.5 text-blue-600 dark:text-cyan-400" />
                    <span>Curated Learning Resources</span>
                  </h4>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {milestone.resources.map((res, rIdx) => (
                      <a
                        key={rIdx}
                        href={res.url || "#"}
                        target="_blank"
                        rel="noreferrer"
                        className="group flex items-start justify-between rounded-xl border border-slate-200/80 bg-slate-50/70 p-2.5 text-xs text-slate-700 hover:border-blue-400 hover:bg-blue-50/30 transition-all dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-300 dark:hover:border-cyan-500/40"
                      >
                        <div>
                          <p className="font-semibold group-hover:text-blue-600 dark:group-hover:text-cyan-400 line-clamp-1">
                            {res.title}
                          </p>
                          <span className="text-[10px] text-slate-400 capitalize">
                            {res.type} {res.estimatedTime ? `• ${res.estimatedTime}` : ""}
                          </span>
                        </div>
                        <ExternalLink className="h-3.5 w-3.5 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-cyan-400 shrink-0 mt-0.5" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Project Deliverables */}
              {milestone.projects?.length > 0 && (
                <div className="mt-5 border-t border-slate-100 dark:border-slate-800/80 pt-4">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5 mb-2.5">
                    <FolderGit2 className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                    <span>Hands-on Project & Deliverables</span>
                  </h4>
                  {milestone.projects.map((proj, pIdx) => (
                    <div
                      key={pIdx}
                      className="rounded-2xl border border-indigo-100 bg-indigo-50/30 p-4 dark:border-indigo-500/20 dark:bg-indigo-950/20"
                    >
                      <h5 className="font-bold text-xs text-slate-900 dark:text-white">
                        {proj.title}
                      </h5>
                      <p className="mt-1 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                        {proj.description}
                      </p>
                      {proj.deliverables?.length > 0 && (
                        <div className="mt-3 space-y-1 text-[11px] text-slate-600 dark:text-slate-400">
                          <span className="font-semibold text-slate-700 dark:text-slate-300">Deliverables:</span>
                          <ul className="list-disc list-inside space-y-0.5 pl-1">
                            {proj.deliverables.map((item, dIdx) => (
                              <li key={dIdx}>{item}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
