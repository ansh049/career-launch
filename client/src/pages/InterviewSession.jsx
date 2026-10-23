import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Mic,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Clock,
  HelpCircle,
  Lightbulb,
  Check,
  Send
} from "lucide-react";
import api from "../services/api";

export default function InterviewSession() {
  const { id, sessionId } = useParams();
  const activeId = id || sessionId;
  const navigate = useNavigate();

  const [session, setSession] = useState(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answerText, setAnswerText] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [finishing, setFinishing] = useState(false);
  const [error, setError] = useState("");

  const [currentEvaluation, setCurrentEvaluation] = useState(null);

  useEffect(() => {
    let active = true;

    async function loadSession() {
      try {
        const res = await api.get(`/api/interviews/sessions/${activeId}`);
        if (active) {
          const s = res.data?.session;
          setSession(s);
          if (s?.status === "completed") {
            navigate(`/interview/feedback/${activeId}`, { replace: true });
            return;
          }
          // Set to first unanswered question
          const answeredCount = s?.answers?.length || 0;
          if (answeredCount < (s?.questionSet?.length || 0)) {
            setCurrentIdx(answeredCount);
          }
        }
      } catch (err) {
        if (active) setError("Failed to load interview session.");
      } finally {
        if (active) setLoading(false);
      }
    }

    if (id) loadSession();
    return () => {
      active = false;
    };
  }, [id, navigate]);

  // Sync answer text when changing questions
  useEffect(() => {
    if (session?.questionSet && session.answers) {
      const q = session.questionSet[currentIdx];
      const existingAnswer = session.answers.find((a) => a.questionId === q?.id);
      if (existingAnswer) {
        setAnswerText(existingAnswer.answer);
        setCurrentEvaluation({
          score: existingAnswer.score,
          rubric_scores: existingAnswer.rubricScores,
          feedback: existingAnswer.feedback,
          key_strengths: existingAnswer.keyStrengths,
          improvements: existingAnswer.improvements,
        });
      } else {
        setAnswerText("");
        setCurrentEvaluation(null);
      }
    }
  }, [currentIdx, session]);

  async function handleSubmitAnswer(e) {
    e.preventDefault();
    if (!answerText.trim() || !session) return;

    const currentQuestion = session.questionSet[currentIdx];
    setSubmitting(true);
    setError("");

    try {
      const res = await api.post(`/api/interviews/sessions/${activeId}/answers`, {
        questionId: currentQuestion.id,
        answer: answerText,
      });

      if (res.data?.evaluation) {
        setCurrentEvaluation(res.data.evaluation);
        setSession(res.data.session);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to evaluate answer.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleFinishSession() {
    setFinishing(true);
    try {
      await api.post(`/api/interviews/sessions/${activeId}/finish`);
      navigate(`/interview/feedback/${activeId}`);
    } catch (err) {
      setError("Failed to conclude session. Please try again.");
    } finally {
      setFinishing(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#090D16]">
        <div className="flex flex-col items-center gap-3 text-slate-500">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-600 dark:text-cyan-400" />
          <p className="text-sm">Preparing mock interview studio questions...</p>
        </div>
      </main>
    );
  }

  if (!session || !session.questionSet?.length) {
    return (
      <main className="min-h-screen flex items-center justify-center p-6 bg-slate-50 dark:bg-[#090D16]">
        <div className="text-center max-w-md">
          <AlertCircle className="h-10 w-10 text-rose-500 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Session Not Found</h2>
          <p className="text-xs text-slate-500 mt-1">{error || "Unable to load interview questions."}</p>
        </div>
      </main>
    );
  }

  const currentQ = session.questionSet[currentIdx];
  const totalQuestions = session.questionSet.length;
  const isLastQuestion = currentIdx === totalQuestions - 1;
  const wordCount = answerText.trim() ? answerText.trim().split(/\s+/).length : 0;

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-[#090D16] px-4 py-8 text-slate-900 dark:text-white sm:px-6 md:px-12 transition-colors duration-200">
      <div className="mx-auto max-w-4xl">
        {/* Top Navigation Bar */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4 mb-6">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-cyan-500/20 dark:text-cyan-400 font-black text-sm">
              {currentIdx + 1}/{totalQuestions}
            </span>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                {session.role}
              </h2>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 capitalize">
                {session.difficulty} Level • {currentQ?.category} Round
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={currentIdx === 0}
              onClick={() => setCurrentIdx((i) => Math.max(0, i - 1))}
              className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-30 dark:border-slate-800 dark:text-slate-300"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              disabled={isLastQuestion}
              onClick={() => setCurrentIdx((i) => Math.min(totalQuestions - 1, i + 1))}
              className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-30 dark:border-slate-800 dark:text-slate-300"
            >
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-600 dark:text-rose-400">
            {error}
          </div>
        )}

        {/* Current Question Display Card */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs dark:border-slate-800 dark:bg-slate-900/60">
          <div className="flex items-center gap-2 mb-3">
            <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-blue-700 dark:bg-cyan-500/20 dark:text-cyan-300">
              {currentQ.category}
            </span>
            <span className="text-xs text-slate-400">• Competency: {currentQ.expectedCompetency}</span>
          </div>

          <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white leading-relaxed">
            {currentQ.question}
          </h1>

          {currentQ.followUpPrompt && (
            <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50/80 p-3 text-xs text-slate-600 dark:border-slate-800/80 dark:bg-slate-950/40 dark:text-slate-400 flex items-start gap-2">
              <Lightbulb className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
              <span>
                <strong>Probe / Follow-Up Consideration:</strong> {currentQ.followUpPrompt}
              </span>
            </div>
          )}
        </div>

        {/* Candidate Answer Box */}
        <form onSubmit={handleSubmitAnswer} className="mt-6 space-y-4">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900/60">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Your Response (Text Studio)
              </label>
              <span className="text-[11px] text-slate-400 font-mono">
                {wordCount} words {wordCount < 40 ? "(aim for 60+ words with STAR details)" : "✓ Good length"}
              </span>
            </div>

            <textarea
              required
              rows={6}
              value={answerText}
              onChange={(e) => setAnswerText(e.target.value)}
              placeholder="State your approach clearly: (1) Situation/Context, (2) Task/Challenge, (3) Concrete Actions taken, (4) Measurable Result..."
              className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 p-4 text-xs sm:text-sm text-slate-900 leading-relaxed focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800/80 dark:text-white"
            />

            <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/80">
              <span className="text-[11px] text-slate-400 italic">
                STAR Method: Situation, Task, Action, Result
              </span>

              <button
                type="submit"
                disabled={submitting || wordCount < 5}
                className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm shadow-blue-500/20 hover:bg-blue-500 dark:bg-cyan-400 dark:text-slate-950 disabled:opacity-50 cursor-pointer"
              >
                {submitting ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                <span>Evaluate Answer</span>
              </button>
            </div>
          </div>
        </form>

        {/* Live Rubric Feedback Card */}
        {currentEvaluation && (
          <div className="mt-6 rounded-3xl border border-emerald-200 bg-emerald-50/20 p-6 sm:p-8 shadow-xs dark:border-emerald-500/30 dark:bg-emerald-950/20 animate-fadeIn space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                  Evaluated Answer Rubric
                </h3>
              </div>
              <span className="font-black text-xl text-emerald-600 dark:text-emerald-400">
                {currentEvaluation.score}/100
              </span>
            </div>

            {/* Rubrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
              <div className="rounded-xl border border-slate-200 bg-white p-2.5 dark:border-slate-800 dark:bg-slate-900">
                <span className="text-[10px] text-slate-400 block">Technical Fit</span>
                <span className="font-bold text-xs text-blue-600 dark:text-cyan-400">
                  {currentEvaluation.rubric_scores?.technical_accuracy || 75}%
                </span>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-2.5 dark:border-slate-800 dark:bg-slate-900">
                <span className="text-[10px] text-slate-400 block">Clarity & Depth</span>
                <span className="font-bold text-xs text-emerald-600 dark:text-emerald-400">
                  {currentEvaluation.rubric_scores?.communication_clarity || 75}%
                </span>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-2.5 dark:border-slate-800 dark:bg-slate-900">
                <span className="text-[10px] text-slate-400 block">STAR Structure</span>
                <span className="font-bold text-xs text-indigo-600 dark:text-indigo-400">
                  {currentEvaluation.rubric_scores?.star_adherence || 70}%
                </span>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-2.5 dark:border-slate-800 dark:bg-slate-900">
                <span className="text-[10px] text-slate-400 block">Relevance</span>
                <span className="font-bold text-xs text-amber-600 dark:text-amber-400">
                  {currentEvaluation.rubric_scores?.relevance || 75}%
                </span>
              </div>
            </div>

            {/* Actionable Feedback text */}
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed rounded-xl border border-slate-200/60 bg-white/70 p-4 dark:border-slate-800 dark:bg-slate-900/80">
              {currentEvaluation.feedback}
            </p>

            {/* Next or Finish Buttons */}
            <div className="pt-2 flex justify-end gap-3">
              {!isLastQuestion ? (
                <button
                  type="button"
                  onClick={() => setCurrentIdx((i) => i + 1)}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-blue-500 dark:bg-cyan-400 dark:text-slate-950 cursor-pointer"
                >
                  <span>Next Question</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  type="button"
                  disabled={finishing}
                  onClick={handleFinishSession}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-2.5 text-xs font-bold text-white shadow-sm shadow-emerald-500/20 hover:from-emerald-500 hover:to-teal-500 cursor-pointer"
                >
                  {finishing ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Check className="h-4 w-4" />
                  )}
                  <span>Conclude & Generate Score Report</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
