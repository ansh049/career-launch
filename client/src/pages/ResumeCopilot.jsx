import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import {
  FileText,
  Sparkles,
  ArrowRight,
  Download,
  Copy,
  Check,
  RefreshCw,
  ShieldCheck,
  Filter,
  CheckCircle2,
  AlertCircle,
  ExternalLink
} from "lucide-react";
import api from "../services/api";
import ResumeSuggestionEditor from "../components/resume/ResumeSuggestionEditor";

export default function ResumeCopilot() {
  const [searchParams] = useSearchParams();
  const initialJobId = searchParams.get("jobId") || "";

  const [jobs, setJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState(initialJobId);
  const [session, setSession] = useState(null);
  const [sessionsList, setSessionsList] = useState([]);

  const [loading, setLoading] = useState(true);
  const [tailoring, setTailoring] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);

  const [activeSection, setActiveSection] = useState("all");
  const [exportedResume, setExportedResume] = useState(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  // Load available published jobs and existing sessions
  useEffect(() => {
    let active = true;

    async function loadData() {
      try {
        const [jobsRes, sessionsRes] = await Promise.all([
          api.get("/api/jobs?limit=50"),
          api.get("/api/resume-copilot/sessions"),
        ]);

        if (active) {
          setJobs(jobsRes.data?.jobs || []);
          const existingSessions = sessionsRes.data?.sessions || [];
          setSessionsList(existingSessions);

          if (initialJobId) {
            const found = existingSessions.find((s) => s.jobId?._id === initialJobId);
            if (found) setSession(found);
          } else if (existingSessions.length > 0) {
            setSession(existingSessions[0]);
            setSelectedJobId(existingSessions[0].jobId?._id || "");
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
  }, [initialJobId]);

  // Start new tailoring session
  async function handleStartTailoring() {
    if (!selectedJobId) return;
    setTailoring(true);
    setError("");
    setExportedResume(null);

    try {
      const res = await api.post("/api/resume-copilot/sessions", {
        jobId: selectedJobId,
      });
      const newSession = res.data?.session;
      if (newSession) {
        setSession(newSession);
        setSessionsList((prev) => [newSession, ...prev]);
        setNotice("Job-tailored suggestions generated based on verified candidate experience.");
        setTimeout(() => setNotice(""), 4000);
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to start resume tailoring session. Please make sure your profile has resume text."
      );
    } finally {
      setTailoring(false);
    }
  }

  // Update suggestion status
  async function handleUpdateSuggestion(suggestionId, status, editedText) {
    if (!session) return;
    setUpdatingId(suggestionId);

    try {
      const res = await api.patch(
        `/api/resume-copilot/sessions/${session._id}/suggestions/${suggestionId}`,
        { status, editedText }
      );
      if (res.data?.session) {
        setSession(res.data.session);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update suggestion.");
    } finally {
      setUpdatingId(null);
    }
  }

  // Export tailored resume
  async function handleExport() {
    if (!session) return;
    setExporting(true);
    setError("");

    try {
      const res = await api.post(`/api/resume-copilot/sessions/${session._id}/export`);
      if (res.data?.exportedResume) {
        setExportedResume(res.data.exportedResume);
        setNotice("Tailored resume compiled successfully! Original resume remains untouched.");
        setTimeout(() => setNotice(""), 5000);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to export resume.");
    } finally {
      setExporting(false);
    }
  }

  // Copy compiled resume text
  function copyToClipboard() {
    if (!exportedResume?.tailoredText) return;
    navigator.clipboard.writeText(exportedResume.tailoredText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  const filteredSuggestions = (session?.suggestions || []).filter((s) => {
    if (activeSection === "all") return true;
    return s.section === activeSection;
  });

  const acceptedCount = (session?.suggestions || []).filter(
    (s) => s.status === "accepted" || s.status === "edited"
  ).length;

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-[#090D16] px-4 py-10 text-slate-900 dark:text-white sm:px-6 md:px-12 lg:px-16 transition-colors duration-200">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="border-b border-slate-200 dark:border-slate-800/80 pb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-200/80 bg-blue-50 px-3.5 py-1 text-xs font-semibold text-blue-700 dark:border-cyan-500/30 dark:bg-cyan-500/10 dark:text-cyan-400 mb-3">
                <FileText className="h-3.5 w-3.5" />
                <span>Job-Specific Resume Copilot (Grounded AI)</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                Resume Tailoring Studio
              </h1>
              <p className="mt-2 text-sm sm:text-base text-slate-600 dark:text-slate-400">
                Ground every bullet point in candidate evidence. Zero fabricated claims, preserving your original resume.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                <ShieldCheck className="h-4 w-4" />
                <span>Original Preserved</span>
              </span>
            </div>
          </div>

          {/* Success / Error Messages */}
          {notice && (
            <div className="mt-4 inline-flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 px-3.5 py-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-4 w-4" />
              <span>{notice}</span>
            </div>
          )}

          {error && (
            <div className="mt-4 flex items-center gap-2 rounded-xl bg-rose-500/10 border border-rose-500/30 p-3 text-xs text-rose-600 dark:text-rose-400">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Job Selection Toolbar */}
          <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900/60">
            <h2 className="text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
              Select Target Job Opening
            </h2>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <select
                value={selectedJobId}
                onChange={(e) => setSelectedJobId(e.target.value)}
                className="flex-1 rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-4 text-xs font-semibold text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800/80 dark:text-white"
              >
                <option value="">-- Choose a published job to tailor for --</option>
                {jobs.map((job) => (
                  <option key={job._id} value={job._id}>
                    {job.title} • {job.company} ({job.location || "Remote"})
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={handleStartTailoring}
                disabled={tailoring || !selectedJobId}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm shadow-blue-500/20 hover:from-blue-500 hover:to-indigo-500 dark:from-cyan-400 dark:to-blue-500 dark:text-slate-950 disabled:opacity-50 cursor-pointer"
              >
                {tailoring ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                <span>Tailor Resume for Role</span>
              </button>
            </div>
          </div>
        </div>

        {/* Existing Sessions Switcher */}
        {sessionsList.length > 1 && (
          <div className="mt-6 flex items-center gap-2 overflow-x-auto pb-2">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider shrink-0 mr-1">
              Tailoring Sessions:
            </span>
            {sessionsList.map((s) => (
              <button
                key={s._id}
                type="button"
                onClick={() => {
                  setSession(s);
                  setSelectedJobId(s.jobId?._id || "");
                  setExportedResume(s.approvedVersion?.tailoredText ? s.approvedVersion : null);
                }}
                className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  session?._id === s._id
                    ? "bg-blue-600 text-white font-bold dark:bg-cyan-400 dark:text-slate-950 shadow-xs"
                    : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-400"
                }`}
              >
                {s.jobId?.title || "Job Session"} ({s.status})
              </button>
            ))}
          </div>
        )}

        {/* Active Session Overview */}
        {session && (
          <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs dark:border-slate-800 dark:bg-slate-900/60">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-0.5 text-[10px] font-bold text-blue-700 dark:bg-cyan-500/20 dark:text-cyan-300">
                  Target: {session.jobId?.title} • {session.jobId?.company}
                </span>
                <h2 className="mt-2 text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
                  {session.tailoredHeadline || "Tailored Engineering Profile"}
                </h2>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  {acceptedCount} of {session.suggestions?.length || 0} suggestions accepted
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">ATS Keyword Match</span>
                  <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                    {session.keywordAlignmentScore || 75}%
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleExport}
                  disabled={exporting}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm shadow-emerald-500/20 hover:from-emerald-500 hover:to-teal-500 cursor-pointer disabled:opacity-50"
                >
                  {exporting ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4" />
                  )}
                  <span>Export Tailored Resume</span>
                </button>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="mt-6 flex items-center gap-2 border-t border-slate-100 dark:border-slate-800/80 pt-4">
              {["all", "summary", "experience", "skills"].map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveSection(tab)}
                  className={`rounded-xl px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    activeSection === tab
                      ? "bg-slate-900 text-white dark:bg-white dark:text-slate-950"
                      : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                  }`}
                >
                  {tab} ({tab === "all" ? session.suggestions?.length || 0 : session.suggestions?.filter((s) => s.section === tab).length || 0})
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Suggestions List */}
        {session && (
          <div className="mt-8 space-y-4">
            {filteredSuggestions.map((sug) => (
              <ResumeSuggestionEditor
                key={sug.id}
                suggestion={sug}
                onUpdateStatus={handleUpdateSuggestion}
                updating={updatingId === sug.id}
              />
            ))}
          </div>
        )}

        {/* Compiled Export Preview Modal / Drawer */}
        {exportedResume && (
          <div className="mt-8 rounded-3xl border border-emerald-200 bg-emerald-50/20 p-6 sm:p-8 shadow-xs dark:border-emerald-500/30 dark:bg-emerald-950/20">
            <div className="flex items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                  Compiled Tailored Resume Preview
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={copyToClipboard}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 cursor-pointer"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copied ? "Copied!" : "Copy Markdown"}</span>
                </button>

                <Link
                  to={`/apply/${selectedJobId}`}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-blue-500 dark:bg-cyan-400 dark:text-slate-950"
                >
                  <span>Apply with This Resume</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>

            <pre className="rounded-2xl border border-slate-200 bg-white p-5 text-xs font-mono text-slate-800 leading-relaxed overflow-x-auto whitespace-pre-wrap dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200">
              {exportedResume.tailoredText}
            </pre>
          </div>
        )}

        {/* Empty State */}
        {!session && !loading && (
          <div className="mt-12 rounded-3xl border border-slate-200 bg-white p-12 text-center max-w-lg mx-auto shadow-xs dark:border-slate-800 dark:bg-slate-900/60">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 mb-4 border border-blue-200 dark:bg-cyan-500/10 dark:text-cyan-400 dark:border-cyan-500/20">
              <FileText className="h-7 w-7" />
            </div>
            <h3 className="font-extrabold text-slate-900 text-lg dark:text-white">
              No Resume Tailoring Session Selected
            </h3>
            <p className="text-slate-500 text-xs mt-2 dark:text-slate-400">
              Select any published job listing from the dropdown above to generate personalized bullet improvements tailored for that specific position.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
