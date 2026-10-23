import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Award,
  CheckCircle2,
  TrendingUp,
  Sparkles,
  ArrowRight,
  RefreshCw,
  AlertCircle,
  HelpCircle,
  BarChart3,
  Layers,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import api from "../services/api";

export default function InterviewFeedback() {
  const { id, sessionId } = useParams();
  const activeId = id || sessionId;
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedQMap, setExpandedQMap] = useState({});

  useEffect(() => {
    let active = true;

    async function loadFeedback() {
      try {
        const res = await api.get(`/api/interviews/sessions/${activeId}`);
        if (active) setSession(res.data?.session);
      } catch (err) {
        if (active) setError("Failed to load interview report.");
      } finally {
        if (active) setLoading(false);
      }
    }

    if (activeId) loadFeedback();
    return () => {
      active = false;
    };
  }, [activeId]);

  function toggleQuestion(qId) {
    setExpandedQMap((prev) => ({ ...prev, [qId]: !prev[qId] }));
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#090D16]">
        <div className="flex flex-col items-center gap-3 text-slate-500">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-600 dark:text-cyan-400" />
          <p className="text-sm">Compiling interview assessment report...</p>
        </div>
      </main>
    );
  }

  if (!session) {
    return (
      <main className="min-h-screen flex items-center justify-center p-6 bg-slate-50 dark:bg-[#090D16]">
        <div className="text-center max-w-md">
          <AlertCircle className="h-10 w-10 text-rose-500 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Report Not Found</h2>
          <p className="text-xs text-slate-500 mt-1">{error || "Unable to find interview report."}</p>
        </div>
      </main>
    );
  }

  const overall = session.overallScore || 75;
  const rubrics = session.rubricSummary || {
    technicalFit: 75,
    communication: 80,
    problemSolving: 75,
    experienceRelevance: 75,
  };
  const feedback = session.feedbackSummary || {
    strengths: ["Clear logical structure", "Good domain awareness"],
    improvementAreas: ["Add quantifiable business outcomes"],
    recommendations: ["Review system design primers"],
  };

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-[#090D16] px-4 py-10 text-slate-900 dark:text-white sm:px-6 md:px-12 lg:px-16 transition-colors duration-200">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="border-b border-slate-200 dark:border-slate-800/80 pb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 mb-3">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Mock Interview Assessment Complete</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                Performance Evaluation & Rubric Report
              </h1>
              <p className="mt-2 text-sm sm:text-base text-slate-600 dark:text-slate-400">
                Independent AI evaluation for {session.role} ({session.difficulty} level). Not shared with prospective employers.
              </p>
            </div>

            <Link
              to="/interview/setup"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm shadow-blue-500/20 hover:from-blue-500 hover:to-indigo-500 dark:from-cyan-400 dark:to-blue-500 dark:text-slate-950"
            >
              <span>Practice Another Round</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* Overall Score & Radar Overview */}
        <div className="mt-8 grid gap-6 sm:grid-cols-12">
          {/* Overall Score Badge */}
          <div className="sm:col-span-5 rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xs dark:border-slate-800 dark:bg-slate-900/60 flex flex-col items-center justify-center">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Composite Mock Score
            </span>
            <div className="mt-4 flex items-baseline justify-center gap-1">
              <span className="text-6xl font-black text-slate-900 dark:text-white">
                {overall}
              </span>
              <span className="text-xl font-bold text-slate-400">/100</span>
            </div>

            <div className="mt-4 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400">
              <Award className="h-4 w-4" />
              <span>{overall >= 80 ? "Interview Ready" : overall >= 65 ? "High Potential" : "Developing Fit"}</span>
            </div>
            <p className="mt-3 text-xs text-slate-500 dark:text-slate-400 max-w-xs">
              Based on {session.answers?.length || 0} evaluated responses evaluated across technical and behavioral dimensions.
            </p>
          </div>

          {/* Rubric Breakdown Grid */}
          <div className="sm:col-span-7 rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs dark:border-slate-800 dark:bg-slate-900/60">
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-blue-500 dark:text-cyan-400" />
              <span>Competency Rubric Scores</span>
            </h3>

            <div className="space-y-4">
              {[
                { label: "Technical Competence & Depth", value: rubrics.technicalFit || overall },
                { label: "Communication & STAR Structure", value: rubrics.communication || overall },
                { label: "Problem Solving & Architecture", value: rubrics.problemSolving || overall },
                { label: "Role Experience Relevance", value: rubrics.experienceRelevance || overall },
              ].map((item, idx) => (
                <div key={idx}>
                  <div className="flex justify-between items-center text-xs mb-1.5">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{item.label}</span>
                    <span className="font-bold text-slate-900 dark:text-white">{item.value}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-blue-600 to-indigo-500 dark:from-cyan-400 dark:to-blue-500"
                      style={{ width: `${item.value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Strengths & Improvement Areas */}
        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          {/* Key Strengths */}
          <div className="rounded-3xl border border-emerald-200 bg-emerald-50/20 p-6 sm:p-7 dark:border-emerald-500/20 dark:bg-emerald-950/10">
            <h3 className="font-extrabold text-xs uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-2 mb-3">
              <CheckCircle2 className="h-4 w-4" />
              <span>Demonstrated Strengths</span>
            </h3>
            <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
              {feedback.strengths?.map((str, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-emerald-500 font-bold shrink-0">✓</span>
                  <span>{str}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Actionable Recommendations */}
          <div className="rounded-3xl border border-amber-200 bg-amber-50/20 p-6 sm:p-7 dark:border-amber-500/20 dark:bg-amber-950/10">
            <h3 className="font-extrabold text-xs uppercase tracking-wider text-amber-700 dark:text-amber-400 flex items-center gap-2 mb-3">
              <TrendingUp className="h-4 w-4" />
              <span>Targeted Improvement Plan</span>
            </h3>
            <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
              {feedback.improvementAreas?.concat(feedback.recommendations || []).map((rec, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-amber-500 font-bold shrink-0">→</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Question-by-Question Audit Review */}
        <div className="mt-10 space-y-4">
          <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <Layers className="h-4 w-4 text-blue-500 dark:text-cyan-400" />
            <span>Question-by-Question Detailed Review ({session.answers?.length || 0})</span>
          </h3>

          {session.answers?.map((ans, idx) => {
            const isExpanded = expandedQMap[ans.questionId] !== false; // default open
            return (
              <div
                key={ans.questionId || idx}
                className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900/60"
              >
                <div
                  className="flex items-start justify-between gap-4 cursor-pointer"
                  onClick={() => toggleQuestion(ans.questionId)}
                >
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Question {idx + 1}
                    </span>
                    <h4 className="mt-1 text-sm font-bold text-slate-900 dark:text-white leading-relaxed">
                      {ans.questionText}
                    </h4>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="rounded-full bg-blue-50 border border-blue-200 px-2.5 py-1 text-xs font-black text-blue-700 dark:bg-cyan-500/10 dark:border-cyan-500/20 dark:text-cyan-400">
                      {ans.score}/100
                    </span>
                    {isExpanded ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
                  </div>
                </div>

                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/80 space-y-3 animate-fadeIn">
                    <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 text-xs dark:border-slate-800 dark:bg-slate-950/60">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                        Candidate Answer:
                      </span>
                      <p className="text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
                        {ans.answer}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-emerald-200 bg-emerald-50/20 p-4 text-xs dark:border-emerald-500/20 dark:bg-emerald-950/20">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 block mb-1">
                        Rubric Feedback:
                      </span>
                      <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                        {ans.feedback}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
