import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  TrendingUp,
  BrainCircuit,
  Building2,
  ExternalLink,
  MapPin,
  Briefcase,
  Search,
  Filter,
  X,
  Send,
  HelpCircle,
  Lightbulb,
  Check,
  RefreshCw,
  Compass,
  ThumbsUp,
  ThumbsDown,
  Bookmark,
  History,
  Layers,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import api from "../services/api";

export default function RecommendationsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [minScore, setMinScore] = useState(0);

  // Explanation Modal state
  const [activeExplainJob, setActiveExplainJob] = useState(null);
  const [explaining, setExplaining] = useState(false);
  const [explanationData, setExplanationData] = useState(null);

  // Feedback state: { [jobId]: 'helpful' | 'unhelpful' | 'saved' }
  const [feedbackMap, setFeedbackMap] = useState({});
  const [feedbackNotice, setFeedbackNotice] = useState("");

  // History Drawer state
  const [showHistory, setShowHistory] = useState(false);
  const [historyItems, setHistoryItems] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Expanded score components toggle map
  const [expandedScoreMap, setExpandedScoreMap] = useState({});

  useEffect(() => {
    let active = true;

    api
      .get("/api/recommendations/me")
      .then(({ data }) => {
        if (active) setItems(data.recommendations || []);
      })
      .catch((err) => {
        if (active) {
          setError(
            err.response?.data?.message ||
              "Unable to load recommendations. Please upload a resume or complete your profile."
          );
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  // Filter recommendations based on search term and minScore
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const score = item.similarity_score ?? item.composite_score ?? 0;
      const matchesScore = score >= minScore;
      if (!matchesScore) return false;

      if (!searchTerm.trim()) return true;

      const term = searchTerm.toLowerCase();
      const inTitle = item.title?.toLowerCase().includes(term);
      const inCompany = item.company?.toLowerCase().includes(term);
      const inSkills = item.matched_skills?.some((s) => s.toLowerCase().includes(term));
      const inMissing = item.missing_skills?.some((s) => s.toLowerCase().includes(term));
      const inLocation = item.location?.toLowerCase().includes(term);

      return inTitle || inCompany || inSkills || inMissing || inLocation;
    });
  }, [items, searchTerm, minScore]);

  // Request AI Explanation for a job match
  async function handleExplain(job) {
    setActiveExplainJob(job);
    setExplaining(true);
    setExplanationData(null);

    try {
      const response = await api.get(`/api/recommendations/explanations/${job.job_id}`);
      if (response.data?.success) {
        setExplanationData({
          summary: response.data.explanation?.summary || `Strong semantic alignment for ${job.title}.`,
          strengths: response.data.explanation?.strengths || job.matched_skills,
          skill_gaps: response.data.explanation?.skill_gaps || job.missing_skills,
          next_steps: response.data.explanation?.next_steps || ["Tailor your resume", "Apply with confidence"],
          score_components: response.data.score_components,
          evidence: response.data.evidence,
          scoring_version: response.data.scoring_version,
        });
        if (response.data.userFeedback) {
          setFeedbackMap((prev) => ({ ...prev, [job.job_id]: response.data.userFeedback }));
        }
      }
    } catch {
      // Fallback to POST /explain
      try {
        const fallbackRes = await api.post("/api/recommendations/explain", {
          title: job.title,
          company: job.company,
          matched_skills: job.matched_skills,
          missing_skills: job.missing_skills,
          similarity_score: job.similarity_score,
        });
        setExplanationData(fallbackRes.data?.explanation || {
          summary: `You are a strong candidate for ${job.title} with matching skills.`,
          strengths: job.matched_skills,
          skill_gaps: job.missing_skills,
          next_steps: ["Review requirements", "Apply"],
        });
      } catch {
        setExplanationData({
          summary: `Strong semantic alignment for ${job.title} based on your technical background and skills.`,
          strengths: job.matched_skills,
          skill_gaps: job.missing_skills,
          next_steps: ["Highlight your matched skills in your application"],
        });
      }
    } finally {
      setExplaining(false);
    }
  }

  // Handle recommendation feedback (helpful, unhelpful, saved)
  async function handleFeedback(jobId, action) {
    setFeedbackMap((prev) => ({ ...prev, [jobId]: action }));
    try {
      await api.post("/api/recommendations/feedback", {
        jobId,
        feedback: action,
        scoringVersion: "v2.0",
      });
      setFeedbackNotice(`Feedback recorded: ${action === "helpful" ? "Marked helpful" : action === "saved" ? "Saved to history" : "Dismissed"}`);
      setTimeout(() => setFeedbackNotice(""), 3000);
    } catch {
      // Handled silently
    }
  }

  // Load feedback history
  async function loadHistory() {
    setShowHistory(true);
    setLoadingHistory(true);
    try {
      const res = await api.get("/api/recommendations/history");
      setHistoryItems(res.data?.history || []);
    } catch {
      setHistoryItems([]);
    } finally {
      setLoadingHistory(false);
    }
  }

  function toggleScoreComponents(jobId) {
    setExpandedScoreMap((prev) => ({ ...prev, [jobId]: !prev[jobId] }));
  }

  function getScoreColor(score) {
    if (score >= 75) return "text-emerald-600 dark:text-emerald-400";
    if (score >= 50) return "text-blue-600 dark:text-cyan-400";
    return "text-indigo-600 dark:text-indigo-400";
  }

  function getBarGradient(score) {
    if (score >= 75) return "from-emerald-500 via-teal-400 to-cyan-500";
    if (score >= 50) return "from-blue-600 via-sky-400 to-cyan-500 dark:from-cyan-500 dark:via-sky-400 dark:to-indigo-500";
    return "from-indigo-600 via-purple-500 to-blue-500 dark:from-indigo-500 dark:via-purple-400 dark:to-sky-500";
  }

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-[#090D16] px-4 py-10 text-slate-900 dark:text-white sm:px-6 md:px-12 lg:px-16 transition-colors duration-200">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="border-b border-slate-200 dark:border-slate-800/80 pb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-200/80 bg-blue-50 px-3.5 py-1 text-xs font-semibold text-blue-700 dark:border-cyan-500/30 dark:bg-cyan-500/10 dark:text-cyan-400 mb-3">
                <BrainCircuit className="h-3.5 w-3.5" />
                <span>Explainable AI Job Matching (Scoring v2.0)</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                Recommended For You
              </h1>
              <p className="mt-2 text-sm sm:text-base text-slate-600 dark:text-slate-400">
                Transparent multi-factor ranking combining semantic relevance, skill overlap, and experience fit.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={loadHistory}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-700 shadow-xs hover:bg-slate-100 hover:text-slate-900 transition-all dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                <History className="h-4 w-4 text-indigo-500 dark:text-indigo-400" />
                <span>Feedback History</span>
              </button>

              <Link
                to="/profile"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-xs hover:bg-slate-100 hover:text-slate-900 transition-all shrink-0 dark:border-cyan-500/30 dark:bg-cyan-500/10 dark:text-cyan-300 dark:hover:bg-cyan-500/20"
              >
                <Sparkles className="h-4 w-4 text-blue-600 dark:text-cyan-400" />
                <span>Update AI Profile</span>
              </Link>
            </div>
          </div>

          {/* Toast Notice */}
          {feedbackNotice && (
            <div className="mt-4 inline-flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 px-3.5 py-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 animate-fadeIn">
              <Check className="h-4 w-4" />
              <span>{feedbackNotice}</span>
            </div>
          )}

          {/* Search & Filter Toolbar */}
          {!loading && items.length > 0 && (
            <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Filter by title, company, or skill (e.g. Python, React)..."
                  className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-xs text-slate-900 placeholder-slate-400 shadow-xs focus:border-blue-500 focus:outline-none dark:border-slate-700/80 dark:bg-slate-900/80 dark:text-white dark:placeholder-slate-500 dark:focus:border-cyan-400"
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => setSearchTerm("")}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-white"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* Match Score Filter Buttons */}
              <div className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white p-1 shadow-xs dark:border-slate-800 dark:bg-slate-900/80">
                <button
                  type="button"
                  onClick={() => setMinScore(0)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                    minScore === 0
                      ? "bg-blue-100 text-blue-700 font-bold dark:bg-cyan-500/20 dark:text-cyan-300 dark:border dark:border-cyan-500/30"
                      : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                  }`}
                >
                  All ({items.length})
                </button>
                <button
                  type="button"
                  onClick={() => setMinScore(50)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                    minScore === 50
                      ? "bg-blue-100 text-blue-700 font-bold dark:bg-cyan-500/20 dark:text-cyan-300 dark:border dark:border-cyan-500/30"
                      : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                  }`}
                >
                  50%+ Match
                </button>
                <button
                  type="button"
                  onClick={() => setMinScore(70)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                    minScore === 70
                      ? "bg-emerald-100 text-emerald-700 font-bold dark:bg-emerald-500/20 dark:text-emerald-300 dark:border dark:border-emerald-500/30"
                      : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                  }`}
                >
                  70%+ Top Fit
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Loading Spinner */}
        {loading && (
          <div className="mt-12 flex flex-col items-center justify-center gap-3 py-12 text-slate-500 dark:text-slate-400">
            <span className="h-8 w-8 rounded-full border-2 border-blue-600 border-t-transparent animate-spin dark:border-cyan-400" />
            <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
              Running semantic sentence embeddings and ranking jobs...
            </p>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div
            role="alert"
            className="mt-8 rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700 flex items-start gap-4 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-red-300"
          >
            <AlertCircle className="h-6 w-6 text-rose-500 dark:text-rose-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-bold text-slate-900 text-base dark:text-white">Recommendations Unavailable</h3>
              <p className="mt-1 text-slate-600 dark:text-slate-300">{error}</p>
              <div className="mt-4">
                <Link
                  to="/profile"
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-500 transition-all dark:bg-cyan-400 dark:text-slate-950 dark:hover:bg-cyan-300"
                >
                  <Sparkles className="h-4 w-4" />
                  <span>Go to AI Profile & Upload Resume</span>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Recommended Cards Grid */}
        {!loading && !error && (
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            {filteredItems.map((item, index) => {
              const score = item.similarity_score;
              const isTopPick = index === 0 && score >= 60;
              const isExpanded = !!expandedScoreMap[item.job_id];
              const components = item.score_components;
              const userFeedback = feedbackMap[item.job_id];

              return (
                <article
                  key={item.job_id}
                  className={`relative flex flex-col justify-between rounded-3xl border bg-white p-6 sm:p-7 shadow-xs backdrop-blur-md transition-all hover:shadow-md hover:border-blue-400 dark:bg-slate-900/60 dark:hover:shadow-2xl dark:hover:shadow-cyan-500/10 ${
                    isTopPick
                      ? "border-blue-300 ring-1 ring-blue-300 dark:border-cyan-500/50 dark:ring-cyan-500/30"
                      : "border-slate-200/80 dark:border-slate-800/80 dark:hover:border-cyan-500/40"
                  }`}
                >
                  {isTopPick && (
                    <div className="absolute -top-3 left-6 inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-3 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-white shadow-sm dark:from-cyan-400 dark:to-blue-500 dark:text-slate-950">
                      <Sparkles className="h-3 w-3" />
                      <span>Top Match</span>
                    </div>
                  )}

                  <div>
                    {/* Header with Company, Title, Meta */}
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-blue-600 dark:text-cyan-400 flex items-center gap-1.5">
                          <Building2 className="h-3.5 w-3.5" />
                          <span>{item.company}</span>
                        </p>
                        <h2 className="mt-1 text-xl font-extrabold text-slate-900 dark:text-white">
                          {item.title}
                        </h2>
                      </div>
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-200 shrink-0 dark:bg-cyan-500/10 dark:text-cyan-400 dark:border-cyan-500/20">
                        <Sparkles className="h-5 w-5" />
                      </div>
                    </div>

                    {/* Job Badges (Location, Work Mode, Job Type) */}
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      {item.location && (
                        <span className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] text-slate-700 dark:border-transparent dark:bg-slate-800/80 dark:text-slate-300">
                          <MapPin className="h-3 w-3 text-slate-400" />
                          <span>{item.location}</span>
                        </span>
                      )}
                      {item.work_mode && (
                        <span className="rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] text-slate-700 capitalize dark:border-transparent dark:bg-slate-800/80 dark:text-slate-300">
                          {item.work_mode}
                        </span>
                      )}
                      {item.job_type && (
                        <span className="rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] text-slate-700 capitalize dark:border-transparent dark:bg-slate-800/80 dark:text-slate-300">
                          {item.job_type}
                        </span>
                      )}
                      {item.experience_level && (
                        <span className="rounded-md bg-indigo-50 border border-indigo-200 px-2 py-0.5 text-[11px] text-indigo-700 capitalize dark:bg-indigo-500/10 dark:border-indigo-500/20 dark:text-indigo-300">
                          {item.experience_level}
                        </span>
                      )}
                    </div>

                    {/* Semantic Relevance Meter */}
                    <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-800/90 dark:bg-slate-950/60">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-600 dark:text-slate-400 font-medium flex items-center gap-1.5">
                          <span>Relevance Score</span>
                          <span className="rounded-full bg-slate-200 px-1.5 py-0.2 text-[9px] font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                            v2.0
                          </span>
                        </span>
                        <span className={`font-black text-sm ${getScoreColor(score)}`}>
                          {score}% Match
                        </span>
                      </div>
                      <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                        <div
                          className={`h-full rounded-full bg-gradient-to-r ${getBarGradient(
                            score
                          )} transition-all duration-700`}
                          style={{ width: `${score}%` }}
                        />
                      </div>

                      {/* Transparent Score Components Toggle */}
                      {components && (
                        <div className="mt-3 pt-3 border-t border-slate-200/70 dark:border-slate-800/70">
                          <button
                            type="button"
                            onClick={() => toggleScoreComponents(item.job_id)}
                            className="flex items-center justify-between w-full text-[11px] text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer"
                          >
                            <span className="flex items-center gap-1">
                              <Layers className="h-3 w-3 text-blue-500 dark:text-cyan-400" />
                              <span>View Score Components Breakdown</span>
                            </span>
                            {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                          </button>

                          {isExpanded && (
                            <div className="mt-2.5 grid grid-cols-3 gap-2 text-center animate-fadeIn">
                              <div className="rounded-xl border border-slate-200 bg-white p-2 dark:border-slate-800 dark:bg-slate-900">
                                <span className="block text-[10px] text-slate-500 dark:text-slate-400">Semantic Fit</span>
                                <span className="font-bold text-xs text-blue-600 dark:text-cyan-400">{components.semantic_score}%</span>
                                <span className="block text-[9px] text-slate-400">Weight 50%</span>
                              </div>
                              <div className="rounded-xl border border-slate-200 bg-white p-2 dark:border-slate-800 dark:bg-slate-900">
                                <span className="block text-[10px] text-slate-500 dark:text-slate-400">Skills Overlap</span>
                                <span className="font-bold text-xs text-emerald-600 dark:text-emerald-400">{components.skill_score}%</span>
                                <span className="block text-[9px] text-slate-400">Weight 35%</span>
                              </div>
                              <div className="rounded-xl border border-slate-200 bg-white p-2 dark:border-slate-800 dark:bg-slate-900">
                                <span className="block text-[10px] text-slate-500 dark:text-slate-400">Experience Fit</span>
                                <span className="font-bold text-xs text-indigo-600 dark:text-indigo-400">{components.experience_score}%</span>
                                <span className="block text-[9px] text-slate-400">Weight 15%</span>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Skill-Gap Analysis: Matching Skills */}
                    <div className="mt-5">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-slate-900 dark:text-white text-xs flex items-center gap-1.5">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                          <span>Matching Skills ({item.matched_skills?.length || 0})</span>
                        </h3>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {item.matched_skills?.map((skill) => (
                          <span
                            key={skill}
                            className="rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800 capitalize dark:border-emerald-500/30 dark:bg-emerald-950/40 dark:text-emerald-300"
                          >
                            {skill}
                          </span>
                        ))}
                        {(!item.matched_skills || item.matched_skills.length === 0) && (
                          <span className="text-xs text-slate-400 italic">
                            No exact skill keywords overlap
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Skill-Gap Analysis: Missing Skills */}
                    {item.missing_skills?.length > 0 && (
                      <div className="mt-4">
                        <h3 className="font-semibold text-slate-900 dark:text-white text-xs flex items-center gap-1.5 mb-2">
                          <TrendingUp className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                          <span>Skills to Develop ({item.missing_skills.length})</span>
                        </h3>
                        <div className="flex flex-wrap gap-1.5">
                          {item.missing_skills.map((skill) => (
                            <span
                              key={skill}
                              className="rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-800 capitalize dark:border-amber-500/30 dark:bg-amber-950/40 dark:text-amber-300"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions & Feedback Bar */}
                  <div className="mt-6 border-t border-slate-100 dark:border-slate-800/80 pt-4 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleExplain(item)}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-blue-600 transition-colors dark:text-slate-400 dark:hover:text-cyan-400 cursor-pointer"
                      >
                        <Sparkles className="h-3.5 w-3.5 text-blue-600 dark:text-cyan-400" />
                        <span>AI Match Insights</span>
                      </button>

                      {/* Feedback Controls */}
                      <div className="flex items-center gap-1 border-l border-slate-200 pl-2 dark:border-slate-800">
                        <button
                          type="button"
                          title="Helpful recommendation"
                          onClick={() => handleFeedback(item.job_id, "helpful")}
                          className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                            userFeedback === "helpful"
                              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400"
                              : "text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400"
                          }`}
                        >
                          <ThumbsUp className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          title="Not interested / unhelpful"
                          onClick={() => handleFeedback(item.job_id, "unhelpful")}
                          className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                            userFeedback === "unhelpful"
                              ? "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400"
                              : "text-slate-400 hover:text-rose-600 dark:hover:text-rose-400"
                          }`}
                        >
                          <ThumbsDown className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          title="Save recommendation"
                          onClick={() => handleFeedback(item.job_id, "saved")}
                          className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                            userFeedback === "saved"
                              ? "bg-blue-100 text-blue-700 dark:bg-cyan-500/20 dark:text-cyan-400"
                              : "text-slate-400 hover:text-blue-600 dark:hover:text-cyan-400"
                          }`}
                        >
                          <Bookmark className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link
                        to={`/jobs/${item.job_id}`}
                        className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-xs dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-200 dark:hover:bg-slate-700"
                      >
                        <span>Details</span>
                        <ExternalLink className="h-3 w-3" />
                      </Link>
                      <Link
                        to={`/apply/${item.job_id}`}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-sm shadow-blue-500/20 hover:from-blue-500 hover:to-indigo-500 transition-all dark:from-cyan-400 dark:to-blue-500 dark:text-slate-950 dark:shadow-cyan-500/20"
                      >
                        <span>Apply</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredItems.length === 0 && (
          <div className="mt-12 rounded-3xl border border-slate-200 bg-white p-10 text-center max-w-md mx-auto shadow-xs dark:border-slate-800 dark:bg-slate-900/60">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 mb-4 border border-blue-200 dark:bg-cyan-500/10 dark:text-cyan-400 dark:border-cyan-500/20">
              <BrainCircuit className="h-7 w-7" />
            </div>
            <h3 className="font-extrabold text-slate-900 text-lg dark:text-white">No Matching Jobs Found</h3>
            <p className="text-slate-500 text-xs mt-2 dark:text-slate-400">
              {items.length === 0
                ? "Upload your resume or complete your candidate profile skills to activate semantic recommendations."
                : "No jobs match your current search/filter criteria. Try clearing filters."}
            </p>
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
              {items.length > 0 ? (
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm("");
                    setMinScore(0);
                  }}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-transparent dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  Reset Filters
                </button>
              ) : (
                <Link
                  to="/profile"
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 font-bold text-white hover:from-blue-500 hover:to-indigo-500 transition-all text-xs shadow-sm shadow-blue-500/20 dark:from-cyan-400 dark:to-blue-500 dark:text-slate-950 dark:shadow-cyan-500/20"
                >
                  <Sparkles className="h-4 w-4" />
                  <span>Build AI Profile & Resume</span>
                </Link>
              )}
              <Link
                to="/jobs"
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Browse All Jobs
              </Link>
            </div>
          </div>
        )}

        {/* AI Explanation Modal */}
        {activeExplainJob && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
            onClick={() => setActiveExplainJob(null)}
          >
            <div
              className="relative w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-2xl backdrop-blur-2xl dark:border-slate-800 dark:bg-slate-900"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setActiveExplainJob(null)}
                className="absolute right-5 top-5 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="flex items-center gap-2.5 mb-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-cyan-500/20 dark:text-cyan-400">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base dark:text-white">AI Match Insights & Evidence</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{activeExplainJob.title} • {activeExplainJob.company}</p>
                </div>
              </div>

              {explaining && (
                <div className="py-8 flex flex-col items-center justify-center gap-3 text-slate-500 dark:text-slate-400">
                  <RefreshCw className="h-6 w-6 animate-spin text-blue-600 dark:text-cyan-400" />
                  <p className="text-xs">Generating match explanation and evidence with AI...</p>
                </div>
              )}

              {!explaining && explanationData && (
                <div className="space-y-4">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/60">
                    <p className="text-xs leading-relaxed text-slate-700 dark:text-slate-300">
                      {explanationData.summary}
                    </p>
                  </div>

                  {/* Strengths */}
                  {explanationData.strengths?.length > 0 && (
                    <div>
                      <h4 className="text-xs font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5 mb-2">
                        <Check className="h-3.5 w-3.5" />
                        <span>Key Strengths & Evidence</span>
                      </h4>
                      <div className="flex flex-wrap gap-1.5">
                        {explanationData.strengths.map((str, i) => (
                          <span
                            key={i}
                            className="rounded-lg border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-950/40 dark:text-emerald-300"
                          >
                            {typeof str === "string" ? str : str.skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Skill Gaps */}
                  {explanationData.skill_gaps?.length > 0 && (
                    <div>
                      <h4 className="text-xs font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1.5 mb-2">
                        <TrendingUp className="h-3.5 w-3.5" />
                        <span>Identified Skill Gaps</span>
                      </h4>
                      <div className="flex flex-wrap gap-1.5">
                        {explanationData.skill_gaps.map((gap, i) => (
                          <span
                            key={i}
                            className="rounded-lg border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-800 dark:border-amber-500/30 dark:bg-amber-950/40 dark:text-amber-300"
                          >
                            {gap}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Next Steps */}
                  {explanationData.next_steps?.length > 0 && (
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-1.5">
                        <Lightbulb className="h-3.5 w-3.5 text-blue-600 dark:text-cyan-400" />
                        <span>Actionable Next Steps</span>
                      </h4>
                      <ul className="space-y-1.5 text-[11px] text-slate-600 dark:text-slate-400 list-disc list-inside">
                        {explanationData.next_steps.map((step, i) => (
                          <li key={i}>{step}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="pt-4 flex justify-between items-center">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleFeedback(activeExplainJob.job_id, "helpful")}
                        className="px-2.5 py-1 text-xs rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        Helpful
                      </button>
                      <button
                        type="button"
                        onClick={() => handleFeedback(activeExplainJob.job_id, "unhelpful")}
                        className="px-2.5 py-1 text-xs rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        Not Relevant
                      </button>
                    </div>

                    <Link
                      to={`/apply/${activeExplainJob.job_id}`}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-500 transition-all dark:bg-cyan-400 dark:text-slate-950 dark:hover:bg-cyan-300"
                      onClick={() => setActiveExplainJob(null)}
                    >
                      <span>Proceed to Apply</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Feedback History Modal */}
        {showHistory && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
            onClick={() => setShowHistory(false)}
          >
            <div
              className="relative w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-2xl backdrop-blur-2xl dark:border-slate-800 dark:bg-slate-900"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setShowHistory(false)}
                className="absolute right-5 top-5 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="flex items-center gap-2.5 mb-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400">
                  <History className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base dark:text-white">Recommendation Feedback History</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Past interaction history and saved jobs</p>
                </div>
              </div>

              {loadingHistory ? (
                <div className="py-8 flex justify-center">
                  <RefreshCw className="h-6 w-6 animate-spin text-blue-600 dark:text-cyan-400" />
                </div>
              ) : historyItems.length === 0 ? (
                <p className="py-6 text-center text-xs text-slate-500 dark:text-slate-400">
                  No feedback interactions recorded yet. Rate or bookmark jobs to see them here!
                </p>
              ) : (
                <div className="max-h-80 overflow-y-auto space-y-2.5 pr-1">
                  {historyItems.map((item) => (
                    <div
                      key={item._id}
                      className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs dark:border-slate-800 dark:bg-slate-950/60"
                    >
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white">
                          {item.jobId?.title || "Job Listing"}
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          {item.jobId?.company} • {item.jobId?.location || "Remote"}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                          item.feedback === "helpful"
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400"
                            : item.feedback === "saved"
                            ? "bg-blue-100 text-blue-700 dark:bg-cyan-500/20 dark:text-cyan-400"
                            : "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-400"
                        }`}>
                          {item.feedback}
                        </span>
                        {item.jobId?._id && (
                          <Link
                            to={`/jobs/${item.jobId._id}`}
                            className="p-1 text-slate-500 hover:text-blue-600 dark:hover:text-cyan-400"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </Link>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}