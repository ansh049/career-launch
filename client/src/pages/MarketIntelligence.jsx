import { useEffect, useState } from "react";
import {
  TrendingUp,
  Compass,
  Briefcase,
  Layers,
  Search,
  RefreshCw,
  Info,
  CheckCircle,
} from "lucide-react";
import api from "../services/api";
import SkillDemandChart from "../components/analytics/SkillDemandChart";

export default function MarketIntelligence() {
  const [roleSearch, setRoleSearch] = useState("");
  const [skills, setSkills] = useState([]);
  const [roleData, setRoleData] = useState(null);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMarketData = async (role = "") => {
    setLoading(true);
    setError(null);
    try {
      const [skillsRes, rolesRes] = await Promise.all([
        api.get("/api/market/skills", { params: { role, limit: 25 } }),
        api.get("/api/market/roles"),
      ]);
      setSkills(skillsRes.data.skills || []);
      setMeta(skillsRes.data.meta || {});
      setRoleData(rolesRes.data || {});
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load market intelligence data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMarketData();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchMarketData(roleSearch);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-slate-200/80 pb-6 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-lg bg-emerald-100 p-2 text-emerald-700 dark:bg-cyan-500/10 dark:text-cyan-400">
              <TrendingUp className="h-5 w-5" />
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Real-Time Job Market Intelligence
            </h1>
          </div>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Real-time skill demand, experience distribution, and role trends across live postings.
          </p>
        </div>

        {/* Role Search */}
        <form onSubmit={handleSearch} className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Filter by role (e.g. Frontend, DevOps)..."
              value={roleSearch}
              onChange={(e) => setRoleSearch(e.target.value)}
              className="w-64 rounded-xl border border-slate-300 bg-white py-2 pl-9 pr-3 text-xs text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>
          <button
            type="submit"
            className="rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-blue-700 dark:bg-cyan-500 dark:text-slate-950 dark:hover:bg-cyan-400"
          >
            Filter
          </button>
        </form>
      </div>

      {error && (
        <div className="mt-6 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-600 dark:text-cyan-400" />
        </div>
      ) : (
        <div className="mt-8 space-y-8">
          {/* Top Row: Skills Chart + Breakdown Cards */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <SkillDemandChart
                topSkills={skills}
                totalJobs={meta?.totalJobsAnalyzed || 0}
                title={roleSearch ? `Skill Demand for "${roleSearch}"` : "Most In-Demand Skills"}
              />
            </div>

            <div className="lg:col-span-5 space-y-6">
              {/* Job Types Distribution */}
              <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900/70">
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">
                  Job Type Distribution
                </h3>
                <div className="space-y-3">
                  {roleData?.jobTypeBreakdown &&
                    Object.entries(roleData.jobTypeBreakdown).map(([type, count]) => (
                      <div key={type} className="flex items-center justify-between text-xs">
                        <span className="capitalize font-medium text-slate-700 dark:text-slate-300">
                          {type}
                        </span>
                        <span className="font-semibold text-slate-900 dark:text-white">
                          {count} positions
                        </span>
                      </div>
                    ))}
                </div>
              </div>

              {/* Experience Level Distribution */}
              <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900/70">
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">
                  Experience Level Demand
                </h3>
                <div className="space-y-3">
                  {roleData?.experienceBreakdown &&
                    Object.entries(roleData.experienceBreakdown).map(([level, count]) => (
                      <div key={level} className="flex items-center justify-between text-xs">
                        <span className="capitalize font-medium text-slate-700 dark:text-slate-300">
                          {level}
                        </span>
                        <span className="font-semibold text-slate-900 dark:text-white">
                          {count} openings
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>

          {/* Data Transparency & Disclaimer Banner */}
          <div className="rounded-2xl border border-blue-200/80 bg-blue-50/60 p-5 text-xs text-blue-900 dark:border-blue-900/50 dark:bg-blue-950/20 dark:text-blue-300">
            <div className="flex items-start gap-3">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-blue-600 dark:text-cyan-400" />
              <div className="space-y-1">
                <span className="font-bold">Labor Market Methodology Note:</span>
                <p className="leading-relaxed">
                  {meta?.dataNote ||
                    `Derived from ${meta?.totalJobsAnalyzed || 0} active listings published on CareerLaunch. Internal platform metrics should be used as directional guidance alongside broader industry reports.`}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
