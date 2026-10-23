import { useEffect, useState, useMemo } from "react";
import { Share2, RefreshCw, Search, Sparkles, Filter, ArrowRight, Layers } from "lucide-react";
import api from "../services/api";

const CATEGORIES = [
  { id: "all", label: "All Skills" },
  { id: "programming_language", label: "Languages" },
  { id: "framework", label: "Frameworks" },
  { id: "database", label: "Databases" },
  { id: "cloud_devops", label: "Cloud & DevOps" },
  { id: "data_science", label: "AI & Data Science" },
  { id: "tool", label: "Tools & Design" },
];

const POPULAR_ROLES = [
  "Full Stack Developer",
  "Frontend Developer",
  "Backend Developer",
  "AI Engineer",
  "DevOps Engineer",
];

const categoryColors = {
  programming_language: "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-500/15 dark:text-blue-300 dark:border-blue-500/30",
  framework: "bg-violet-100 text-violet-700 border-violet-200 dark:bg-violet-500/15 dark:text-violet-300 dark:border-violet-500/30",
  database: "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30",
  cloud: "bg-sky-100 text-sky-700 border-sky-200 dark:bg-sky-500/15 dark:text-sky-300 dark:border-sky-500/30",
  devops: "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-500/15 dark:text-orange-300 dark:border-orange-500/30",
  data_science: "bg-pink-100 text-pink-700 border-pink-200 dark:bg-pink-500/15 dark:text-pink-300 dark:border-pink-500/30",
  design: "bg-fuchsia-100 text-fuchsia-700 border-fuchsia-200 dark:bg-fuchsia-500/15 dark:text-fuchsia-300 dark:border-fuchsia-500/30",
  soft_skill: "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/30",
  tool: "bg-teal-100 text-teal-700 border-teal-200 dark:bg-teal-500/15 dark:text-teal-300 dark:border-teal-500/30",
  other: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
};

export default function CareerGraph() {
  const [graph, setGraph] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [related, setRelated] = useState([]);
  const [relatedLoading, setRelatedLoading] = useState(false);
  const [rolePath, setRolePath] = useState(null);
  const [roleSearch, setRoleSearch] = useState("");
  const [roleSearching, setRoleSearching] = useState(false);
  const [activeCategory, setActiveCategory] = useState("all");
  const [skillSearchQuery, setSkillSearchQuery] = useState("");

  async function loadGraph() {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/api/career/graph?limit=100");
      setGraph(res.data);
      if (res.data?.nodes?.length > 0) {
        // Auto-select React or the first node if nothing is selected yet
        const defaultSkill =
          res.data.nodes.find((n) => n.name.toLowerCase() === "react") ||
          res.data.nodes[0];
        handleSkillClick(defaultSkill);
      }
    } catch {
      setError("Failed to load skill graph. Please try refreshing.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadGraph();
  }, []);

  async function handleSkillClick(skill) {
    if (!skill) return;
    setSelectedSkill(skill);
    setRelatedLoading(true);
    try {
      const res = await api.get(`/api/career/skills/${skill.id || skill._id}/related?limit=12`);
      setRelated(res.data?.related || []);
    } catch {
      setRelated([]);
    } finally {
      setRelatedLoading(false);
    }
  }

  async function searchRolePath(roleToSearch) {
    const query = (roleToSearch || roleSearch).trim();
    if (!query) return;
    setRoleSearching(true);
    try {
      const res = await api.get(`/api/career/roles/${encodeURIComponent(query)}/skill-path`);
      setRolePath(res.data);
      if (roleToSearch) setRoleSearch(roleToSearch);
    } catch {
      setRolePath(null);
    } finally {
      setRoleSearching(false);
    }
  }

  function handlePathSkillClick(skillName) {
    if (!graph?.nodes) return;
    const clean = skillName.toLowerCase().trim();
    const match = graph.nodes.find(
      (n) => n.name.toLowerCase().trim() === clean || n.name.toLowerCase().includes(clean)
    );
    if (match) {
      handleSkillClick(match);
    }
  }

  // Filter skills by category & search term
  const filteredNodes = useMemo(() => {
    if (!graph?.nodes) return [];
    return graph.nodes.filter((node) => {
      // Category filter
      if (activeCategory === "cloud_devops") {
        if (node.category !== "cloud" && node.category !== "devops") return false;
      } else if (activeCategory === "tool") {
        if (node.category !== "tool" && node.category !== "design") return false;
      } else if (activeCategory !== "all" && node.category !== activeCategory) {
        return false;
      }

      // Search query filter
      if (skillSearchQuery.trim()) {
        const q = skillSearchQuery.toLowerCase().trim();
        return node.name.toLowerCase().includes(q) || node.category.toLowerCase().includes(q);
      }
      return true;
    });
  }, [graph, activeCategory, skillSearchQuery]);

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-[#090D16] px-4 py-10 text-slate-900 dark:text-white sm:px-6 md:px-12 lg:px-16 transition-colors duration-200">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="border-b border-slate-200 dark:border-slate-800/80 pb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-3.5 py-1 text-xs font-semibold text-violet-700 dark:border-violet-500/30 dark:bg-violet-950/40 dark:text-violet-300 mb-3">
              <Share2 className="h-3.5 w-3.5" />
              <span>Career Knowledge Graph</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Skill Relationships & Learning Paths</h1>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Interactive technology graph mapping skill co-occurrences, prerequisite pathways, and role competencies.
            </p>
          </div>

          <button
            type="button"
            onClick={loadGraph}
            disabled={loading}
            className="inline-flex items-center gap-2 self-start md:self-auto rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin text-blue-500" : ""}`} />
            Refresh Graph
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-600 dark:text-rose-400">
            {error}
          </div>
        )}

        {/* Role Path Explorer */}
        <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
            <Sparkles className="h-4 w-4 text-blue-500" />
            <span>Role-Based Skill Curriculum</span>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={roleSearch}
                onChange={(e) => setRoleSearch(e.target.value)}
                placeholder="Search target role (e.g., 'Full Stack Developer', 'Data Scientist')..."
                onKeyDown={(e) => e.key === "Enter" && searchRolePath()}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 py-2.5 text-sm focus:border-blue-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800/80 dark:text-white"
              />
            </div>
            <button
              type="button"
              onClick={() => searchRolePath()}
              disabled={roleSearching}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-blue-500 transition cursor-pointer disabled:opacity-50"
            >
              {roleSearching ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Search className="h-3.5 w-3.5" />}
              Generate Path
            </button>
          </div>

          {/* Quick role presets */}
          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 mr-1">Popular roles:</span>
            {POPULAR_ROLES.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => searchRolePath(r)}
                className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-700 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-blue-500 dark:hover:text-blue-300 transition cursor-pointer"
              >
                {r}
              </button>
            ))}
          </div>

          {/* Role Path Results */}
          {rolePath && (
            <div className="mt-5 rounded-xl border border-blue-200 bg-blue-50/50 p-4 dark:border-blue-500/20 dark:bg-blue-950/20">
              <div className="flex items-center justify-between gap-2 mb-2">
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                  Curriculum for "{rolePath.role}"
                </h3>
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  {rolePath.totalJobsAnalyzed} job listings analyzed
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mb-3">
                Click any skill below to inspect its graph connections:
              </p>

              {rolePath.path?.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {rolePath.path.map((s, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handlePathSkillClick(s.name)}
                      className="group inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 shadow-sm hover:border-blue-500 hover:bg-blue-500 hover:text-white dark:border-blue-500/30 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-blue-600 dark:hover:text-white transition cursor-pointer"
                    >
                      <span>{s.name}</span>
                      <span className="rounded-full bg-slate-100 px-1.5 py-0.2 text-[10px] text-slate-600 group-hover:bg-blue-700 group-hover:text-white dark:bg-slate-700 dark:text-slate-300">
                        {s.frequency}%
                      </span>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 dark:text-slate-400">No matching skills found for this role.</p>
              )}
              {rolePath.note && <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-3 italic">{rolePath.note}</p>}
            </div>
          )}
        </div>

        {/* Skill Graph Explorer Grid */}
        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          {/* Main Nodes Area */}
          <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <Layers className="h-4 w-4 text-violet-500" />
                  <span>Interactive Skill Nodes ({filteredNodes.length})</span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Click any skill chip to view its connected technologies and relationship metrics.
                </p>
              </div>

              {/* Instant Search Filter */}
              <div className="relative w-full sm:w-56">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  value={skillSearchQuery}
                  onChange={(e) => setSkillSearchQuery(e.target.value)}
                  placeholder="Filter skills..."
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 pl-8 pr-3 py-1.5 text-xs focus:border-blue-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap gap-1.5 mb-5 pb-3 border-b border-slate-100 dark:border-slate-800/80">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCategory(cat.id)}
                  className={`rounded-full px-3 py-1 text-xs font-semibold transition cursor-pointer ${
                    activeCategory === cat.id
                      ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Skill Nodes List */}
            {loading ? (
              <div className="py-16 flex flex-col items-center justify-center gap-2 text-slate-400">
                <RefreshCw className="h-6 w-6 animate-spin text-blue-500" />
                <span className="text-xs">Loading skill nodes...</span>
              </div>
            ) : filteredNodes.length > 0 ? (
              <div className="flex flex-wrap gap-2 max-h-[500px] overflow-y-auto pr-1">
                {filteredNodes.map((node) => {
                  const isSelected = selectedSkill?.id === node.id || selectedSkill?._id === node.id;
                  const colorClass = categoryColors[node.category] || categoryColors.other;
                  return (
                    <button
                      key={node.id}
                      type="button"
                      onClick={() => handleSkillClick(node)}
                      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold cursor-pointer transition-all duration-150 hover:scale-105 ${
                        isSelected
                          ? "ring-2 ring-blue-500 ring-offset-2 dark:ring-blue-400 dark:ring-offset-slate-900 shadow-md font-bold"
                          : "opacity-90 hover:opacity-100"
                      } ${colorClass}`}
                    >
                      <span>{node.name}</span>
                      {isSelected && <span className="h-1.5 w-1.5 rounded-full bg-blue-600 dark:bg-blue-400 animate-pulse" />}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="py-12 text-center text-slate-400 text-xs">
                No skills matching "{skillSearchQuery}". Try clearing the filter.
              </div>
            )}
          </div>

          {/* Selected Skill Detail & Related Nodes Panel */}
          <div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/60 sticky top-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <h2 className="text-sm font-extrabold text-slate-900 dark:text-white">
                  Skill Relationship Inspector
                </h2>
                {selectedSkill && (
                  <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    {selectedSkill.category?.replace("_", " ")}
                  </span>
                )}
              </div>

              {selectedSkill ? (
                <div className="mt-4">
                  <div className="p-3.5 rounded-xl border border-blue-100 bg-blue-50/50 dark:border-blue-900/40 dark:bg-blue-950/20 mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-base font-extrabold text-blue-950 dark:text-blue-100">
                        {selectedSkill.name}
                      </span>
                      <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                        Active Node
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Showing connected technologies and co-occurrence frequency in job listings.
                    </p>
                  </div>

                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2.5">
                    Connected Technologies ({related.length})
                  </h3>

                  {relatedLoading ? (
                    <div className="py-8 flex justify-center">
                      <RefreshCw className="h-5 w-5 animate-spin text-blue-500" />
                    </div>
                  ) : related.length > 0 ? (
                    <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                      {related.map((r, i) => {
                        const targetSkill = r.skill;
                        if (!targetSkill) return null;
                        const pct = Math.round((r.confidence || 0.7) * 100);
                        return (
                          <button
                            key={i}
                            type="button"
                            onClick={() => {
                              // Navigate graph by clicking connected skill
                              const fullNode = graph?.nodes?.find(
                                (n) => n.id === targetSkill._id || n.name === targetSkill.name
                              );
                              handleSkillClick(fullNode || { id: targetSkill._id, ...targetSkill });
                            }}
                            className="w-full text-left p-2.5 rounded-xl border border-slate-100 bg-slate-50/80 hover:border-blue-300 hover:bg-blue-50/60 dark:border-slate-800 dark:bg-slate-800/50 dark:hover:border-blue-600 dark:hover:bg-blue-950/40 transition flex items-center justify-between group cursor-pointer"
                          >
                            <div>
                              <div className="text-xs font-bold text-slate-800 group-hover:text-blue-600 dark:text-slate-200 dark:group-hover:text-blue-300 flex items-center gap-1.5">
                                <span>{targetSkill.name}</span>
                                <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition text-blue-500" />
                              </div>
                              <span className="text-[10px] text-slate-400 dark:text-slate-500 capitalize">
                                {r.relationshipType || "related"}
                              </span>
                            </div>

                            <div className="text-right">
                              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                {pct}%
                              </span>
                              <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mt-1 overflow-hidden">
                                <div
                                  className="h-full bg-blue-500 rounded-full"
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="p-4 text-center rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        No direct connections recorded yet.
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="mt-8 rounded-2xl border border-dashed border-slate-200 p-8 text-center dark:border-slate-800">
                  <Filter className="h-8 w-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                  <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
                    Click any skill on the left to inspect its relationships.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

