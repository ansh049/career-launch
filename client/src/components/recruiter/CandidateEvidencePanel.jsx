import React, { useState } from "react";
import { CheckCircle2, XCircle, Star, Send, ShieldAlert, Award } from "lucide-react";
import api from "../../services/api";

export default function CandidateEvidencePanel({
  candidate,
  jobId,
  onReviewSubmitted,
}) {
  const [rating, setRating] = useState(5);
  const [decision, setDecision] = useState("shortlisted");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState("");

  if (!candidate) {
    return (
      <div className="flex h-64 items-center justify-center rounded-2xl border border-dashed border-slate-300 p-8 text-sm text-slate-500 dark:border-slate-800 dark:text-slate-400">
        Select a candidate to view evidence breakdown and match signals.
      </div>
    );
  }

  const { candidateId, name, email, matchScore = 0, matchedSkills = [], missingSkills = [] } = candidate;

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFeedbackMsg("");
    try {
      await api.post(`/api/recruiter/candidates/${candidateId}/review`, {
        jobId,
        decision,
        rating: Number(rating),
        notes,
      });
      setFeedbackMsg("Review saved successfully.");
      if (onReviewSubmitted) onReviewSubmitted();
    } catch (err) {
      setFeedbackMsg(err?.response?.data?.message || "Failed to submit review.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900/70">
      {/* Candidate Header */}
      <div className="flex items-start justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">{name}</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">{email}</p>
        </div>
        <div className="text-right">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Match Score
          </span>
          <div className="text-2xl font-black text-blue-600 dark:text-cyan-400">
            {matchScore}%
          </div>
        </div>
      </div>

      {/* Match Score Meter */}
      <div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
          <div
            className="h-full rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all dark:from-cyan-400 dark:to-blue-500"
            style={{ width: `${Math.min(100, Math.max(5, matchScore))}%` }}
          />
        </div>
      </div>

      {/* Skills Evidence Section */}
      <div className="space-y-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 mb-2">
            <CheckCircle2 className="h-4 w-4" /> Matched Skills ({matchedSkills.length})
          </span>
          <div className="flex flex-wrap gap-1.5">
            {matchedSkills.length > 0 ? (
              matchedSkills.map((skill) => (
                <span
                  key={skill}
                  className="rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60"
                >
                  {skill}
                </span>
              ))
            ) : (
              <span className="text-xs text-slate-400">No direct skill matches found.</span>
            )}
          </div>
        </div>

        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1.5 mb-2">
            <XCircle className="h-4 w-4" /> Missing / Unverified Skills ({missingSkills.length})
          </span>
          <div className="flex flex-wrap gap-1.5">
            {missingSkills.length > 0 ? (
              missingSkills.map((skill) => (
                <span
                  key={skill}
                  className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                >
                  {skill}
                </span>
              ))
            ) : (
              <span className="text-xs text-emerald-600 dark:text-emerald-400">All required skills present!</span>
            )}
          </div>
        </div>
      </div>

      {/* Recruiter Evaluation Form */}
      <form onSubmit={handleSubmitReview} className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Recruiter Review & Decision
        </h4>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Decision
            </label>
            <select
              value={decision}
              onChange={(e) => setDecision(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            >
              <option value="shortlisted">Shortlist</option>
              <option value="reviewing">Under Review</option>
              <option value="rejected">Reject</option>
              <option value="accepted">Offer / Accept</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Rating (1–5)
            </label>
            <input
              type="number"
              min="1"
              max="5"
              value={rating}
              onChange={(e) => setRating(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
            Evaluation Notes
          </label>
          <textarea
            rows="3"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Key observations on candidate's experience and fit..."
            className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          />
        </div>

        {feedbackMsg && (
          <p className="text-xs font-medium text-blue-600 dark:text-cyan-400">{feedbackMsg}</p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-blue-700 disabled:opacity-50 dark:bg-cyan-500 dark:text-slate-950 dark:hover:bg-cyan-400"
        >
          <Send className="h-3.5 w-3.5" />
          {submitting ? "Saving..." : "Save Candidate Review"}
        </button>
      </form>

      {/* Disclaimers & Ethics */}
      <div className="rounded-xl bg-slate-50 p-3 text-[11px] leading-relaxed text-slate-500 dark:bg-slate-800/40 dark:text-slate-400">
        AI matching scores provide informational skill overlap heuristics. Final hiring decisions rest strictly with human recruiters.
      </div>
    </div>
  );
}
