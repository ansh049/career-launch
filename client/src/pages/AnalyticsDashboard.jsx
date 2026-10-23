import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
  BarChart3,
  TrendingUp,
  FileCheck,
  CheckCircle,
  HelpCircle,
  Sparkles,
  RefreshCw,
  Info,
  Award,
  Layers,
} from "lucide-react";
import api from "../services/api";
import ConversionChart from "../components/analytics/ConversionChart";
import SkillDemandChart from "../components/analytics/SkillDemandChart";

export default function AnalyticsDashboard() {
  const { user } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(true);
  const [candidateData, setCandidateData] = useState(null);
  const [recruiterData, setRecruiterData] = useState(null);
  const [marketData, setMarketData] = useState(null);
  const [error, setError] = useState(null);

  const isRecruiter = user?.role === "recruiter";

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      if (isRecruiter) {
        const [recRes, mktRes] = await Promise.all([
          api.get("/api/analytics/recruiter"),
          api.get("/api/analytics/market"),
        ]);
        setRecruiterData(recRes.data.analytics);
        setMarketData(mktRes.data.analytics);
      } else {
        const [candRes, mktRes] = await Promise.all([
          api.get("/api/analytics/candidate"),
          api.get("/api/analytics/market"),
        ]);
        setCandidateData(candRes.data.analytics);
        setMarketData(mktRes.data.analytics);
      }
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load analytics data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [user]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-600 dark:text-cyan-400" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200/80 pb-6 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-lg bg-blue-100 p-2 text-blue-700 dark:bg-cyan-500/10 dark:text-cyan-400">
              <BarChart3 className="h-5 w-5" />
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              {isRecruiter ? "Hiring Analytics & Funnel" : "Career & Application Analytics"}
            </h1>
          </div>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            {isRecruiter
              ? "Comprehensive recruitment conversion pipeline and talent metrics."
              : "Track your job hunt velocity, interview performance, and skill progression."}
          </p>
        </div>

        <button
          onClick={fetchAnalytics}
          className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
        >
          <RefreshCw className="h-4 w-4" /> Refresh
        </button>
      </div>

      {error && (
        <div className="mt-6 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300">
          {error}
        </div>
      )}

      {/* KPI Cards Row */}
      {isRecruiter && recruiterData && (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900/70">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider dark:text-slate-400">
              Total Applications
            </span>
            <div className="mt-2 text-3xl font-extrabold text-slate-900 dark:text-white">
              {recruiterData.applications?.total || 0}
            </div>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Across all posted positions</p>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900/70">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider dark:text-slate-400">
              Active Listings
            </span>
            <div className="mt-2 text-3xl font-extrabold text-blue-600 dark:text-cyan-400">
              {recruiterData.jobs?.active || 0}
            </div>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Of {recruiterData.jobs?.total || 0} total jobs
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900/70">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider dark:text-slate-400">
              Shortlist Rate
            </span>
            <div className="mt-2 text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">
              {recruiterData.conversionRate}%
            </div>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Applications moved to review</p>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900/70">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider dark:text-slate-400">
              Market Sample Size
            </span>
            <div className="mt-2 text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
              {marketData?.totalJobsAnalyzed || 0}
            </div>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Platform listings benchmarked</p>
          </div>
        </div>
      )}

      {!isRecruiter && candidateData && (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900/70">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider dark:text-slate-400">
              Total Applications
            </span>
            <div className="mt-2 text-3xl font-extrabold text-slate-900 dark:text-white">
              {candidateData.applications?.total || 0}
            </div>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {candidateData.applications?.recent || 0} in past 90 days
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900/70">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider dark:text-slate-400">
              Employer Response Rate
            </span>
            <div className="mt-2 text-3xl font-extrabold text-blue-600 dark:text-cyan-400">
              {candidateData.applications?.responseRate || 0}%
            </div>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Applications reviewed by recruiter</p>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900/70">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider dark:text-slate-400">
              Mock Interview Score
            </span>
            <div className="mt-2 text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">
              {candidateData.interviews?.avgScore || 0}%
            </div>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {candidateData.interviews?.completed || 0} sessions completed
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900/70">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider dark:text-slate-400">
              Roadmap Progress
            </span>
            <div className="mt-2 text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
              {candidateData.roadmaps?.progressPercent || 0}%
            </div>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {candidateData.roadmaps?.completedMilestones || 0} / {candidateData.roadmaps?.totalMilestones || 0} milestones
            </p>
          </div>
        </div>
      )}

      {/* Main Charts Grid */}
      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Pipeline chart */}
        <ConversionChart
          byStatus={
            isRecruiter
              ? recruiterData?.applications?.byStatus
              : candidateData?.applications?.byStatus
          }
          total={
            isRecruiter
              ? recruiterData?.applications?.total
              : candidateData?.applications?.total
          }
          title={isRecruiter ? "Candidate Pipeline Conversion" : "My Application Funnel"}
        />

        {/* Skill demand chart */}
        <SkillDemandChart
          topSkills={marketData?.topSkills || []}
          totalJobs={marketData?.totalJobsAnalyzed || 0}
          title="Market Demand Trends"
        />
      </div>

      {/* Methodology and Data Disclaimers Notice */}
      <div className="mt-8 rounded-2xl border border-amber-200/80 bg-amber-50/70 p-5 text-xs text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/20 dark:text-amber-300">
        <div className="flex items-start gap-3">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
          <div className="space-y-1">
            <span className="font-bold">Data Transparency & Analytics Disclaimer:</span>
            <p className="leading-relaxed">
              {candidateData?.dataNote || recruiterData?.dataNote || marketData?.dataNote ||
                "Metrics and trends displayed above reflect activity on the CareerLaunch platform only. Sample sizes represent live internal listings and do not constitute universal labor market guarantees."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
