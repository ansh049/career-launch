import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Scale, CheckCircle2, XCircle, RefreshCw, Award } from "lucide-react";
import api from "../services/api";

export default function CandidateComparison() {
  const { jobId } = useParams();
  const [candidates, setCandidates] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadCandidates() {
      if (!jobId) return;
      setLoading(true);
      try {
        const res = await api.get(`/api/recruiter/jobs/${jobId}/candidate-matches`);
        const list = res.data.candidates || [];
        setCandidates(list);
        // Default to comparing the top 2 candidates
        setSelectedIds(list.slice(0, 2).map((c) => c.candidateId));
      } catch (err) {
        setError(err?.response?.data?.message || "Failed to load candidates for comparison.");
      } finally {
        setLoading(false);
      }
    }
    loadCandidates();
  }, [jobId]);

  const toggleSelectCandidate = (id) => {
    if (selectedIds.includes(id)) {
      if (selectedIds.length > 1) {
        setSelectedIds(selectedIds.filter((item) => item !== id));
      }
    } else {
      if (selectedIds.length < 3) {
        setSelectedIds([...selectedIds, id]);
      } else {
        alert("You can compare up to 3 candidates simultaneously.");
      }
    }
  };

  const comparedCandidates = candidates.filter((c) => selectedIds.includes(c.candidateId));

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-slate-200/80 pb-6 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800">
        <div>
          <Link
            to={`/recruiter/jobs/${jobId}/intelligence`}
            className="mb-2 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Recruiter Copilot
          </Link>
          <div className="flex items-center gap-2">
            <span className="rounded-lg bg-indigo-100 p-2 text-indigo-700 dark:bg-cyan-500/10 dark:text-cyan-400">
              <Scale className="h-5 w-5" />
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Side-by-Side Candidate Comparison
            </h1>
          </div>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Compare skills, AI match breakdowns, and qualifications across top applicants.
          </p>
        </div>
      </div>

      {error && (
        <div className="mt-6 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300">
          {error}
        </div>
      )}

      {/* Candidate Selector Badges */}
      <div className="mt-6">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Select Candidates to Compare (up to 3):
        </label>
        <div className="mt-2 flex flex-wrap gap-2">
          {candidates.map((cand) => {
            const isSelected = selectedIds.includes(cand.candidateId);
            return (
              <button
                key={cand.candidateId}
                onClick={() => toggleSelectCandidate(cand.candidateId)}
                className={`rounded-xl border px-3 py-1.5 text-xs font-semibold transition-all ${
                  isSelected
                    ? "border-blue-600 bg-blue-50 text-blue-700 dark:border-cyan-400 dark:bg-cyan-950/30 dark:text-cyan-300"
                    : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                }`}
              >
                {cand.name} ({cand.matchScore}%)
              </button>
            );
          })}
        </div>
      </div>

      {/* Comparison Grid */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-600 dark:text-cyan-400" />
        </div>
      ) : comparedCandidates.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-slate-200/80 bg-white p-12 text-center text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-400">
          Select at least one candidate above to begin comparison.
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {comparedCandidates.map((cand) => (
            <div
              key={cand.candidateId}
              className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900/70"
            >
              <div>
                <div className="flex items-start justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      {cand.name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{cand.email}</p>
                  </div>
                  <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-black text-blue-700 dark:bg-cyan-500/10 dark:text-cyan-300">
                    {cand.matchScore}%
                  </span>
                </div>

                {/* Score bar */}
                <div className="mt-4">
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-cyan-400 dark:to-blue-500"
                      style={{ width: `${cand.matchScore}%` }}
                    />
                  </div>
                </div>

                {/* Matched skills */}
                <div className="mt-6 space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4" /> Matched Skills ({cand.matchedSkills?.length || 0})
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {cand.matchedSkills?.map((s) => (
                      <span
                        key={s}
                        className="rounded-lg bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Missing skills */}
                <div className="mt-6 space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                    <XCircle className="h-4 w-4" /> Missing Skills ({cand.missingSkills?.length || 0})
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {cand.missingSkills?.map((s) => (
                      <span
                        key={s}
                        className="rounded-lg bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
                <Link
                  to={`/recruiter/jobs/${jobId}/intelligence`}
                  className="text-xs font-semibold text-blue-600 hover:underline dark:text-cyan-400"
                >
                  Inspect Evidence in Copilot &rarr;
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
