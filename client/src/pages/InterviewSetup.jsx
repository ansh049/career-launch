import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  Mic,
  Sparkles,
  ArrowRight,
  BrainCircuit,
  Award,
  Clock,
  History,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Building2
} from "lucide-react";
import api from "../services/api";

const COMMON_ROLES = [
  "Full Stack Engineer",
  "Frontend Developer (React)",
  "Backend Engineer (Node/Python)",
  "System Architect",
  "DevOps & Cloud Engineer",
];

export default function InterviewSetup() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialRole = searchParams.get("role") || "Full Stack Engineer";
  const initialJobId = searchParams.get("jobId") || "";

  const [role, setRole] = useState(initialRole);
  const [jobId, setJobId] = useState(initialJobId);
  const [interviewType, setInterviewType] = useState("mixed");
  const [difficulty, setDifficulty] = useState("mid");

  const [history, setHistory] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadData() {
      try {
        const [historyRes, jobsRes] = await Promise.all([
          api.get("/api/interviews/history"),
          api.get("/api/jobs?limit=25"),
        ]);
        if (active) {
          setHistory(historyRes.data?.history || []);
          setJobs(jobsRes.data?.jobs || []);
        }
      } catch {
        // Fallback
      } finally {
        if (active) setLoading(false);
      }
    }

    loadData();
    return () => {
      active = false;
    };
  }, []);

  async function handleStartSession(e) {
    e.preventDefault();
    if (!role.trim()) return;

    setStarting(true);
    setError("");

    try {
      const res = await api.post("/api/interviews/sessions", {
        role,
        jobId: jobId || undefined,
        interviewType,
        difficulty,
      });

      const session = res.data?.session;
      if (session?._id) {
        navigate(`/interview/session/${session._id}`);
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to start mock interview session."
      );
    } finally {
      setStarting(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-[#090D16] px-4 py-10 text-slate-900 dark:text-white sm:px-6 md:px-12 lg:px-16 transition-colors duration-200">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="border-b border-slate-200 dark:border-slate-800/80 pb-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200/80 bg-blue-50 px-3.5 py-1 text-xs font-semibold text-blue-700 dark:border-cyan-500/30 dark:bg-cyan-500/10 dark:text-cyan-400 mb-3">
            <Mic className="h-3.5 w-3.5" />
            <span>AI Mock Interview Studio</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Interview Studio Setup
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-600 dark:text-slate-400">
            Practice role-specific technical and behavioral questions evaluated against industry rubrics. Zero risk, instant feedback.
          </p>
        </div>

        {error && (
          <div className="mt-6 flex items-center gap-2 rounded-2xl bg-rose-500/10 border border-rose-500/30 p-4 text-xs text-rose-600 dark:text-rose-400">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Configuration Form */}
        <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs dark:border-slate-800 dark:bg-slate-900/60">
          <form onSubmit={handleStartSession} className="space-y-6">
            {/* Target Role */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                Target Role
              </label>
              <input
                type="text"
                required
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="e.g. Senior Full Stack Engineer"
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-xs font-semibold text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800/80 dark:text-white"
              />
              <div className="mt-2 flex flex-wrap gap-1.5">
                {COMMON_ROLES.map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className="rounded-lg bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 cursor-pointer"
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {/* Link with Specific Job (Optional) */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                Associate with Published Job (Optional)
              </label>
              <select
                value={jobId}
                onChange={(e) => {
                  setJobId(e.target.value);
                  const selected = jobs.find((j) => j._id === e.target.value);
                  if (selected) setRole(selected.title);
                }}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-xs font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-200"
              >
                <option value="">-- General role interview (no specific job) --</option>
                {jobs.map((j) => (
                  <option key={j._id} value={j._id}>
                    {j.title} • {j.company} ({j.location || "Remote"})
                  </option>
                ))}
              </select>
            </div>

            {/* Type & Difficulty Row */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                  Interview Format
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "mixed", label: "Mixed (Tech + STAR)" },
                    { id: "technical", label: "Pure Technical" },
                    { id: "behavioral", label: "Behavioral Only" },
                  ].map((fmt) => (
                    <button
                      key={fmt.id}
                      type="button"
                      onClick={() => setInterviewType(fmt.id)}
                      className={`rounded-xl border p-2.5 text-center text-xs font-semibold transition-all cursor-pointer ${
                        interviewType === fmt.id
                          ? "border-blue-500 bg-blue-50 text-blue-700 dark:border-cyan-400 dark:bg-cyan-500/20 dark:text-cyan-300 font-bold"
                          : "border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800"
                      }`}
                    >
                      {fmt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                  Seniority Level
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "entry", label: "Entry Level" },
                    { id: "mid", label: "Mid-Level" },
                    { id: "senior", label: "Senior / Lead" },
                  ].map((lvl) => (
                    <button
                      key={lvl.id}
                      type="button"
                      onClick={() => setDifficulty(lvl.id)}
                      className={`rounded-xl border p-2.5 text-center text-xs font-semibold transition-all cursor-pointer ${
                        difficulty === lvl.id
                          ? "border-blue-500 bg-blue-50 text-blue-700 dark:border-cyan-400 dark:bg-cyan-500/20 dark:text-cyan-300 font-bold"
                          : "border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800"
                      }`}
                    >
                      {lvl.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                disabled={starting || !role.trim()}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 text-xs font-bold text-white shadow-sm shadow-blue-500/20 hover:from-blue-500 hover:to-indigo-500 dark:from-cyan-400 dark:to-blue-500 dark:text-slate-950 disabled:opacity-50 cursor-pointer"
              >
                {starting ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Mic className="h-4 w-4" />
                )}
                <span>Launch Mock Interview Session</span>
              </button>
            </div>
          </form>
        </div>

        {/* History Section */}
        {history.length > 0 && (
          <div className="mt-12 space-y-4">
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <History className="h-4 w-4 text-blue-500 dark:text-cyan-400" />
              <span>Past Interview Sessions ({history.length})</span>
            </h3>

            <div className="grid gap-3 sm:grid-cols-2">
              {history.map((item) => (
                <div
                  key={item._id}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900/60 flex items-center justify-between"
                >
                  <div>
                    <span className="font-bold text-sm text-slate-900 dark:text-white block">
                      {item.role}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 block mt-0.5 capitalize">
                      {item.difficulty} • {item.interviewType} • {item.status}
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-1">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="text-right flex items-center gap-3">
                    {item.overallScore > 0 && (
                      <div>
                        <span className="text-[10px] text-slate-400 block">Score</span>
                        <span className="font-black text-sm text-blue-600 dark:text-cyan-400">
                          {item.overallScore}%
                        </span>
                      </div>
                    )}
                    <Link
                      to={
                        item.status === "completed"
                          ? `/interview/feedback/${item._id}`
                          : `/interview/session/${item._id}`
                      }
                      className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                    >
                      {item.status === "completed" ? "Review Report" : "Resume"}
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
