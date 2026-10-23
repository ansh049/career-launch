import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  BrainCircuit,
  Users,
  Sparkles,
  ClipboardCheck,
  RefreshCw,
  Scale,
  Award,
  Layers,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import api from "../services/api";
import CandidateEvidencePanel from "../components/recruiter/CandidateEvidencePanel";

export default function RecruiterIntelligence() {
  const { jobId: paramJobId } = useParams();
  const [jobs, setJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState(paramJobId || "");
  const [candidates, setCandidates] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [interviewKit, setInterviewKit] = useState(null);
  const [generatingKit, setGeneratingKit] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch recruiter's jobs
  useEffect(() => {
    async function loadJobs() {
      try {
        const res = await api.get("/api/jobs/mine");
        const list = res.data.jobs || res.data || [];
        setJobs(list);
        if (!selectedJobId && list.length > 0) {
          setSelectedJobId(list[0]._id);
        }
      } catch (err) {
        setError("Failed to load your posted jobs.");
      } finally {
        setLoading(false);
      }
    }
    loadJobs();
  }, []);

  // Fetch candidate matches when selected job changes
  const fetchMatches = async (jobId) => {
    if (!jobId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/api/recruiter/jobs/${jobId}/candidate-matches`);
      const matched = res.data.candidates || [];
      setCandidates(matched);
      if (matched.length > 0) {
        setSelectedCandidate(matched[0]);
      } else {
        setSelectedCandidate(null);
      }
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load candidate matches.");
      setCandidates([]);
      setSelectedCandidate(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedJobId) {
      fetchMatches(selectedJobId);
      setInterviewKit(null);
    }
  }, [selectedJobId]);

  // Generate Interview Kit
  const handleGenerateInterviewKit = async () => {
    if (!selectedJobId) return;
    setGeneratingKit(true);
    try {
      const res = await api.post(`/api/recruiter/jobs/${selectedJobId}/interview-kit`, {
        experienceLevel: "Mid-level",
      });
      setInterviewKit(res.data.kit);
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to generate interview kit.");
    } finally {
      setGeneratingKit(false);
    }
  };

  const selectedJob = jobs.find((j) => String(j._id) === String(selectedJobId));

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-slate-200/80 pb-6 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-lg bg-indigo-100 p-2 text-indigo-700 dark:bg-cyan-500/10 dark:text-cyan-400">
              <BrainCircuit className="h-5 w-5" />
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Recruiter Intelligence Copilot
            </h1>
          </div>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Explainable AI candidate matching, evidence audit trails, and automated interview rubrics.
          </p>
        </div>

        {/* Job selector dropdown */}
        <div className="flex items-center gap-3">
          <select
            value={selectedJobId}
            onChange={(e) => setSelectedJobId(e.target.value)}
            className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-900 shadow-xs focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          >
            {jobs.map((job) => (
              <option key={job._id} value={job._id}>
                {job.title} ({job.company || "Job"})
              </option>
            ))}
          </select>

          {selectedJobId && (
            <Link
              to={`/recruiter/jobs/${selectedJobId}/compare`}
              className="flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 shadow-xs hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              <Scale className="h-4 w-4" /> Compare
            </Link>
          )}
        </div>
      </div>

      {error && (
        <div className="mt-6 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300">
          {error}
        </div>
      )}

      {/* Main Grid: Candidates List + Evidence Panel */}
      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Left column: Candidate Matches */}
        <div className="lg:col-span-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-600 dark:text-cyan-400" />
              Ranked Candidate Pool ({candidates.length})
            </h2>
            <button
              onClick={() => fetchMatches(selectedJobId)}
              className="text-xs font-semibold text-blue-600 hover:underline dark:text-cyan-400"
            >
              Refresh Ranking
            </button>
          </div>

          {loading ? (
            <div className="flex h-48 items-center justify-center">
              <RefreshCw className="h-6 w-6 animate-spin text-blue-600 dark:text-cyan-400" />
            </div>
          ) : candidates.length === 0 ? (
            <div className="rounded-2xl border border-slate-200/80 bg-white p-8 text-center text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-400">
              No applicant profiles found for this listing yet.
            </div>
          ) : (
            <div className="space-y-3">
              {candidates.map((cand) => {
                const isSelected = selectedCandidate?.candidateId === cand.candidateId;
                return (
                  <div
                    key={cand.candidateId}
                    onClick={() => setSelectedCandidate(cand)}
                    className={`cursor-pointer rounded-2xl border p-4 transition-all ${
                      isSelected
                        ? "border-blue-500 bg-blue-50/50 shadow-md dark:border-cyan-500/80 dark:bg-cyan-950/20"
                        : "border-slate-200/80 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900/70 dark:hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-slate-900 dark:text-white">{cand.name}</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{cand.email}</p>
                      </div>
                      <div className="text-right">
                        <span className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-black text-blue-700 dark:bg-cyan-500/10 dark:text-cyan-300">
                          {cand.matchScore}% Match
                        </span>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                      <span>{cand.matchedSkills?.length || 0} matching skills</span>
                      <span className="flex items-center gap-1 font-semibold text-blue-600 dark:text-cyan-400">
                        View Evidence <ChevronRight className="h-3.5 w-3.5" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Interview Kit Generator Action */}
          <div className="rounded-2xl border border-indigo-200/80 bg-gradient-to-br from-indigo-50/60 to-purple-50/40 p-5 dark:border-indigo-900/40 dark:from-indigo-950/20 dark:to-purple-950/20">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-indigo-950 dark:text-indigo-200 flex items-center gap-2">
                  <ClipboardCheck className="h-4 w-4" /> AI Interview Kit & Rubrics
                </h3>
                <p className="mt-1 text-xs text-indigo-800/80 dark:text-indigo-300/80">
                  Generate structured role-specific questions and scoring criteria.
                </p>
              </div>
              <button
                onClick={handleGenerateInterviewKit}
                disabled={generatingKit || !selectedJobId}
                className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-indigo-700 disabled:opacity-50 dark:bg-cyan-500 dark:text-slate-950 dark:hover:bg-cyan-400"
              >
                {generatingKit ? "Generating..." : "Generate Kit"}
              </button>
            </div>

            {interviewKit && (
              <div className="mt-4 space-y-3 pt-4 border-t border-indigo-100 dark:border-indigo-900/40">
                <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-900 dark:text-indigo-300">
                  Questions & Evaluation Rubric:
                </h4>
                {interviewKit.questions?.map((q, idx) => (
                  <div
                    key={idx}
                    className="rounded-xl bg-white p-3 text-xs shadow-xs dark:bg-slate-900/80"
                  >
                    <div className="font-semibold text-slate-900 dark:text-white">
                      {idx + 1}. {q.question || q}
                    </div>
                    {q.rubric && (
                      <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                        <strong>Expected:</strong> {q.rubric}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right column: Evidence Breakdown & Human Review Panel */}
        <div className="lg:col-span-6">
          <CandidateEvidencePanel
            candidate={selectedCandidate}
            jobId={selectedJobId}
            onReviewSubmitted={() => fetchMatches(selectedJobId)}
          />
        </div>
      </div>
    </div>
  );
}
