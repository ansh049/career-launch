import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  Compass,
  Sparkles,
  Target,
  ArrowRight,
  TrendingUp,
  BrainCircuit,
  CheckCircle2,
  RefreshCw,
  Plus,
  BookOpen,
  FolderGit2,
  AlertCircle
} from "lucide-react";
import api from "../services/api";
import SkillGapList from "../components/career/SkillGapList";
import RoadmapTimeline from "../components/career/RoadmapTimeline";

const SUGGESTED_ROLES = [
  "Full Stack Engineer",
  "Frontend Developer",
  "Backend Engineer",
  "AI / Machine Learning Engineer",
  "Cloud & DevOps Engineer",
];

export default function CareerRoadmap() {
  const [searchParams] = useSearchParams();
  const initialRole = searchParams.get("role") || "Full Stack Engineer";
  const initialJobId = searchParams.get("jobId") || "";

  const [targetRole, setTargetRole] = useState(initialRole);
  const [targetJobId, setTargetJobId] = useState(initialJobId);
  const [currentLevel, setCurrentLevel] = useState("Junior");

  const [activeTab, setActiveTab] = useState("timeline"); // "timeline" | "gaps"
  const [roadmaps, setRoadmaps] = useState([]);
  const [selectedRoadmap, setSelectedRoadmap] = useState(null);
  const [gapAnalysis, setGapAnalysis] = useState(null);

  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [analyzingGaps, setAnalyzingGaps] = useState(false);
  const [updatingMilestoneId, setUpdatingMilestoneId] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  // Load existing roadmaps on mount
  useEffect(() => {
    let active = true;

    async function loadInitial() {
      try {
        const res = await api.get("/api/career/roadmaps");
        if (active) {
          const list = res.data?.roadmaps || [];
          setRoadmaps(list);
          if (list.length > 0) {
            setSelectedRoadmap(list[0]);
            setTargetRole(list[0].targetRole);
          }
        }
      } catch {
        // No roadmaps yet
      } finally {
        if (active) setLoading(false);
      }
    }

    loadInitial();
    return () => {
      active = false;
    };
  }, []);

  // Run Gap Analysis
  async function runGapAnalysis() {
    setAnalyzingGaps(true);
    setError("");
    try {
      const res = await api.post("/api/career/gap-analysis", {
        targetRole,
        targetJobId: targetJobId || undefined,
      });
      setGapAnalysis(res.data?.analysis || null);
      setActiveTab("gaps");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to analyze skill gaps.");
    } finally {
      setAnalyzingGaps(false);
    }
  }

  // Generate or regenerate career roadmap
  async function handleGenerateRoadmap() {
    setGenerating(true);
    setError("");
    try {
      const res = await api.post("/api/career/roadmaps", {
        targetRole,
        targetJobId: targetJobId || undefined,
        currentLevel,
      });
      const newRoadmap = res.data?.roadmap;
      if (newRoadmap) {
        setSelectedRoadmap(newRoadmap);
        setRoadmaps((prev) => [newRoadmap, ...prev]);
        setActiveTab("timeline");
        setNotice("Personalized Career Roadmap generated successfully!");
        setTimeout(() => setNotice(""), 4000);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to generate roadmap.");
    } finally {
      setGenerating(false);
    }
  }

  // Update milestone status
  async function handleMilestoneStatusChange(milestoneId, newStatus) {
    if (!selectedRoadmap) return;
    setUpdatingMilestoneId(milestoneId);

    try {
      const res = await api.patch(
        `/api/career/roadmaps/${selectedRoadmap._id}/milestones/${milestoneId}`,
        { status: newStatus }
      );
      const updated = res.data?.roadmap;
      if (updated) {
        setSelectedRoadmap(updated);
        setRoadmaps((prev) =>
          prev.map((r) => (r._id === updated._id ? updated : r))
        );
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update milestone.");
    } finally {
      setUpdatingMilestoneId(null);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-[#090D16] px-4 py-10 text-slate-900 dark:text-white sm:px-6 md:px-12 lg:px-16 transition-colors duration-200">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="border-b border-slate-200 dark:border-slate-800/80 pb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-200/80 bg-blue-50 px-3.5 py-1 text-xs font-semibold text-blue-700 dark:border-cyan-500/30 dark:bg-cyan-500/10 dark:text-cyan-400 mb-3">
                <Compass className="h-3.5 w-3.5" />
                <span>AI Career Architect & Skill Roadmaps</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                Personalized Career Roadmap
              </h1>
              <p className="mt-2 text-sm sm:text-base text-slate-600 dark:text-slate-400">
                Bridge the gap between your current skills and target role requirements with structured, project-driven milestones.
              </p>
            </div>

            <Link
              to="/recommendations"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-xs hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 self-start sm:self-auto"
            >
              <span>View Job Matches</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Success Banner */}
          {notice && (
            <div className="mt-4 inline-flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 px-3.5 py-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-4 w-4" />
              <span>{notice}</span>
            </div>
          )}

          {/* Error Banner */}
          {error && (
            <div className="mt-4 flex items-center gap-2 rounded-xl bg-rose-500/10 border border-rose-500/30 p-3 text-xs text-rose-600 dark:text-rose-400">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Target Role Selector Toolbar */}
          <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900/60">
            <h2 className="text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
              Configure Target Career Path
            </h2>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  placeholder="Enter target role (e.g. Senior Backend Engineer)..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-4 text-xs font-semibold text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800/80 dark:text-white"
                />
              </div>

              <select
                value={currentLevel}
                onChange={(e) => setCurrentLevel(e.target.value)}
                className="rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3 text-xs font-semibold text-slate-700 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-200"
              >
                <option value="Intern / Student">Intern / Student</option>
                <option value="Junior">Junior Engineer (0-2 yrs)</option>
                <option value="Mid-Level">Mid-Level (2-5 yrs)</option>
                <option value="Senior">Senior Specialist (5+ yrs)</option>
              </select>

              <button
                type="button"
                onClick={runGapAnalysis}
                disabled={analyzingGaps || !targetRole.trim()}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 disabled:opacity-50 cursor-pointer"
              >
                {analyzingGaps ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Target className="h-4 w-4 text-rose-500" />
                )}
                <span>Analyze Skill Gaps</span>
              </button>

              <button
                type="button"
                onClick={handleGenerateRoadmap}
                disabled={generating || !targetRole.trim()}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm shadow-blue-500/20 hover:from-blue-500 hover:to-indigo-500 dark:from-cyan-400 dark:to-blue-500 dark:text-slate-950 disabled:opacity-50 cursor-pointer"
              >
                {generating ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                <span>Generate Roadmap</span>
              </button>
            </div>

            {/* Quick Suggestions Chips */}
            <div className="mt-3 flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] text-slate-400 mr-1">Popular Roles:</span>
              {SUGGESTED_ROLES.map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => setTargetRole(role)}
                  className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-all cursor-pointer ${
                    targetRole === role
                      ? "bg-blue-100 text-blue-700 dark:bg-cyan-500/20 dark:text-cyan-300 border border-blue-300 dark:border-cyan-500/30"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Saved Roadmaps Tabs (if multiple) */}
        {roadmaps.length > 1 && (
          <div className="mt-6 flex items-center gap-2 overflow-x-auto pb-2">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider shrink-0 mr-1">
              Your Paths:
            </span>
            {roadmaps.map((r) => (
              <button
                key={r._id}
                type="button"
                onClick={() => {
                  setSelectedRoadmap(r);
                  setTargetRole(r.targetRole);
                }}
                className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  selectedRoadmap?._id === r._id
                    ? "bg-blue-600 text-white shadow-xs dark:bg-cyan-400 dark:text-slate-950 font-bold"
                    : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-400"
                }`}
              >
                {r.targetRole} ({r.overallProgress}%)
              </button>
            ))}
          </div>
        )}

        {/* Selected Roadmap Overview Card */}
        {selectedRoadmap && (
          <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs dark:border-slate-800 dark:bg-slate-900/60">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-0.5 text-[10px] font-bold text-blue-700 dark:bg-cyan-500/20 dark:text-cyan-300">
                  Active Career Roadmap • v{selectedRoadmap.version || 1}.0
                </span>
                <h2 className="mt-2 text-2xl font-extrabold text-slate-900 dark:text-white">
                  {selectedRoadmap.targetRole}
                </h2>
                <p className="mt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-2xl">
                  {selectedRoadmap.summary}
                </p>
              </div>

              <div className="text-left sm:text-right shrink-0">
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Roadmap Progress</span>
                <p className="text-3xl font-black text-blue-600 dark:text-cyan-400">
                  {selectedRoadmap.overallProgress}%
                </p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-600 to-indigo-500 dark:from-cyan-400 dark:to-blue-500 transition-all duration-700"
                style={{ width: `${selectedRoadmap.overallProgress}%` }}
              />
            </div>

            {/* Navigation Tabs (Timeline vs Skill Gaps) */}
            <div className="mt-6 flex items-center gap-3 border-t border-slate-100 dark:border-slate-800/80 pt-4">
              <button
                type="button"
                onClick={() => setActiveTab("timeline")}
                className={`rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "timeline"
                    ? "bg-slate-900 text-white dark:bg-white dark:text-slate-950"
                    : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                }`}
              >
                Milestone Timeline ({selectedRoadmap.milestones?.length || 0})
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!gapAnalysis) runGapAnalysis();
                  else setActiveTab("gaps");
                }}
                className={`rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "gaps"
                    ? "bg-slate-900 text-white dark:bg-white dark:text-slate-950"
                    : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                }`}
              >
                Prioritized Skill Gaps
              </button>
            </div>
          </div>
        )}

        {/* Content Section */}
        <div className="mt-8">
          {activeTab === "timeline" && selectedRoadmap && (
            <RoadmapTimeline
              milestones={selectedRoadmap.milestones}
              onUpdateStatus={handleMilestoneStatusChange}
              updatingId={updatingMilestoneId}
            />
          )}

          {activeTab === "gaps" && (
            <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs dark:border-slate-800 dark:bg-slate-900/60">
              <SkillGapList analysis={gapAnalysis} loading={analyzingGaps} />
            </div>
          )}

          {!selectedRoadmap && !loading && (
            <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center max-w-lg mx-auto shadow-xs dark:border-slate-800 dark:bg-slate-900/60">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 mb-4 border border-blue-200 dark:bg-cyan-500/10 dark:text-cyan-400 dark:border-cyan-500/20">
                <Compass className="h-7 w-7" />
              </div>
              <h3 className="font-extrabold text-slate-900 text-lg dark:text-white">
                No Career Roadmap Active Yet
              </h3>
              <p className="text-slate-500 text-xs mt-2 dark:text-slate-400">
                Enter your desired job title above and click "Generate Roadmap" to generate a step-by-step career development path.
              </p>
              <button
                type="button"
                onClick={handleGenerateRoadmap}
                disabled={generating}
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 font-bold text-white hover:from-blue-500 hover:to-indigo-500 transition-all text-xs shadow-sm shadow-blue-500/20 dark:from-cyan-400 dark:to-blue-500 dark:text-slate-950"
              >
                <Sparkles className="h-4 w-4" />
                <span>Generate Roadmap for {targetRole}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
