import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  BrainCircuit,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Clock,
  Compass,
  FileText
} from "lucide-react";
import api from "../services/api";
import WorkflowStepList from "../components/agent/WorkflowStepList";

const SUGGESTED_GOALS = [
  "Match me with top frontend jobs, analyze my skill gaps, and prepare a tailored application package.",
  "Create a 3-month roadmap for Full Stack Engineer roles and tailor my resume.",
  "Identify highest-paying opportunities matching my Python and AWS background and draft my cover notes.",
];

export default function CareerAssistant() {
  const [goal, setGoal] = useState("");
  const [session, setSession] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [pendingApprovals, setPendingApprovals] = useState([]);

  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let active = true;

    async function loadData() {
      try {
        const [sessRes, appRes] = await Promise.all([
          api.get("/api/agent/sessions"),
          api.get("/api/agent/approvals"),
        ]);
        if (active) {
          const list = sessRes.data?.sessions || [];
          setSessions(list);
          setPendingApprovals(appRes.data?.approvals || []);
          if (list.length > 0) {
            setSession(list[0]);
          }
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

  async function handleLaunchAgent(e) {
    if (e) e.preventDefault();
    if (!goal.trim()) return;

    setRunning(true);
    setError("");

    try {
      const res = await api.post("/api/agent/sessions", { goal });
      const newSession = res.data?.session;
      if (newSession) {
        setSession(newSession);
        setSessions((prev) => [newSession, ...prev]);

        // Check for pending approvals
        const appRes = await api.get("/api/agent/approvals");
        setPendingApprovals(appRes.data?.approvals || []);

        setNotice("Autonomous agent workflow launched!");
        setTimeout(() => setNotice(""), 4000);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to start agent workflow.");
    } finally {
      setRunning(false);
    }
  }

  async function handleContinueStep() {
    if (!session) return;
    setRunning(true);
    setError("");

    try {
      const res = await api.post(`/api/agent/sessions/${session._id}/run`);
      if (res.data?.session) {
        setSession(res.data.session);

        const appRes = await api.get("/api/agent/approvals");
        setPendingApprovals(appRes.data?.approvals || []);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to execute next step.");
    } finally {
      setRunning(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-[#090D16] px-4 py-10 text-slate-900 dark:text-white sm:px-6 md:px-12 lg:px-16 transition-colors duration-200">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="border-b border-slate-200 dark:border-slate-800/80 pb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-200/80 bg-blue-50 px-3.5 py-1 text-xs font-semibold text-blue-700 dark:border-cyan-500/30 dark:bg-cyan-500/10 dark:text-cyan-400 mb-3">
                <BrainCircuit className="h-3.5 w-3.5" />
                <span>Autonomous Agentic Career Assistant (LangGraph Pipeline)</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                Career Assistant Copilot
              </h1>
              <p className="mt-2 text-sm sm:text-base text-slate-600 dark:text-slate-400">
                End-to-end multi-step AI orchestration connecting recommendations, gap analysis, roadmaps, and resume tailoring.
              </p>
            </div>

            <Link
              to="/approvals"
              className="relative inline-flex items-center gap-2 rounded-xl border border-amber-300 bg-amber-50 px-4 py-2.5 text-xs font-bold text-amber-800 shadow-xs hover:bg-amber-100 dark:border-amber-500/30 dark:bg-amber-950/40 dark:text-amber-300 dark:hover:bg-amber-900/40 shrink-0"
            >
              <ShieldAlert className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              <span>Approval Queue</span>
              {pendingApprovals.length > 0 && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-[10px] font-black text-white">
                  {pendingApprovals.length}
                </span>
              )}
            </Link>
          </div>

          {/* Pending Approval Alert Banner */}
          {pendingApprovals.length > 0 && (
            <div className="mt-6 rounded-2xl border border-amber-300 bg-amber-50/80 p-4 dark:border-amber-500/30 dark:bg-amber-950/40 flex items-center justify-between gap-3 animate-pulse">
              <div className="flex items-center gap-2.5 text-xs font-bold text-amber-900 dark:text-amber-300">
                <ShieldAlert className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
                <span>
                  Action Awaiting Your Approval: The agent has halted before submitting an application draft.
                </span>
              </div>
              <Link
                to="/approvals"
                className="rounded-xl bg-amber-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-amber-500 shrink-0"
              >
                Review & Sign Off
              </Link>
            </div>
          )}

          {notice && (
            <div className="mt-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              {notice}
            </div>
          )}

          {error && (
            <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-600 dark:text-rose-400 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Goal Input Card */}
          <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900/60">
            <h2 className="text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              What is your primary career goal?
            </h2>
            <form onSubmit={handleLaunchAgent} className="space-y-3">
              <textarea
                required
                rows={3}
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                placeholder="Instruct the assistant (e.g. Find matching senior engineering roles, analyze my skill gaps, and prepare tailored application materials)..."
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 p-3.5 text-xs sm:text-sm text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800/80 dark:text-white"
              />

              {/* Preset Goal Suggestions */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] text-slate-400 mr-1">Quick Prompts:</span>
                {SUGGESTED_GOALS.map((prompt, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setGoal(prompt)}
                    className="rounded-lg bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 line-clamp-1 max-w-xs text-left"
                  >
                    {prompt}
                  </button>
                ))}
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={running || !goal.trim()}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-2.5 text-xs font-bold text-white shadow-sm shadow-blue-500/20 hover:from-blue-500 hover:to-indigo-500 dark:from-cyan-400 dark:to-blue-500 dark:text-slate-950 disabled:opacity-50 cursor-pointer"
                >
                  {running ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                  <span>Launch Autonomous Assistant</span>
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Existing Sessions Switcher */}
        {sessions.length > 1 && (
          <div className="mt-6 flex items-center gap-2 overflow-x-auto pb-2">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider shrink-0 mr-1">
              Active Sessions:
            </span>
            {sessions.map((s) => (
              <button
                key={s._id}
                type="button"
                onClick={() => setSession(s)}
                className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  session?._id === s._id
                    ? "bg-blue-600 text-white font-bold dark:bg-cyan-400 dark:text-slate-950 shadow-xs"
                    : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-400"
                }`}
              >
                {s.goal.slice(0, 30)}... ({s.status})
              </button>
            ))}
          </div>
        )}

        {/* Active Session Overview */}
        {session && (
          <div className="mt-8 space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs dark:border-slate-800 dark:bg-slate-900/60">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-0.5 text-[10px] font-bold text-blue-700 dark:bg-cyan-500/20 dark:text-cyan-300 capitalize">
                    Status: {session.status.replace("_", " ")}
                  </span>
                  <h3 className="mt-2 text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
                    {session.goal}
                  </h3>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    {session.summary}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {session.status === "running" && (
                    <button
                      type="button"
                      disabled={running}
                      onClick={handleContinueStep}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-500 dark:bg-cyan-400 dark:text-slate-950"
                    >
                      {running ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : (
                        <ArrowRight className="h-4 w-4" />
                      )}
                      <span>Execute Next Stage</span>
                    </button>
                  )}

                  {session.status === "awaiting_approval" && (
                    <Link
                      to="/approvals"
                      className="inline-flex items-center gap-1.5 rounded-xl bg-amber-600 px-4 py-2 text-xs font-bold text-white hover:bg-amber-500"
                    >
                      <ShieldAlert className="h-4 w-4" />
                      <span>Review in Approval Queue</span>
                    </Link>
                  )}
                </div>
              </div>
            </div>

            {/* Workflow Step Timeline */}
            <div>
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
                Workflow Execution Stages & Audit Trail
              </h3>
              <WorkflowStepList steps={session.steps} />
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
