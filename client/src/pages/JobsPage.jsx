import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  Search,
  MapPin,
  Briefcase,
  Clock,
  Sparkles,
  ArrowRight,
  SlidersHorizontal,
  X,
  CheckCircle,
  Building,
  DollarSign
} from "lucide-react";
import api from "../services/api";

const jobTypeOptions = [
  { value: "", label: "All job types" },
  { value: "internship", label: "Internship" },
  { value: "full-time", label: "Full-time" },
  { value: "part-time", label: "Part-time" },
  { value: "contract", label: "Contract" },
];

export default function JobsPage() {
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get("q") || "";

  const [jobs, setJobs] = useState([]);
  const [query, setQuery] = useState(initialQuery);
  const [type, setType] = useState("");
  const [loadedFilter, setLoadedFilter] = useState(null);
  const [error, setError] = useState("");

  const filterKey = `${query}\u0000${type}`;
  const loading = loadedFilter !== filterKey;

  useEffect(() => {
    let active = true;

    api.get("/api/jobs", {
      params: {
        q: query || undefined,
        employmentType: type || undefined,
      },
    })
      .then(({ data }) => {
        const availableJobs = data.jobs ?? data.data;
        if (!Array.isArray(availableJobs)) {
          throw new Error("The jobs response was invalid.");
        }

        if (active) {
          setJobs(availableJobs);
          setError("");
        }
      })
      .catch((requestError) => {
        if (active) {
          setError(
            requestError.response?.data?.message ||
              requestError.message ||
              "Could not load jobs."
          );
        }
      })
      .finally(() => {
        if (active) setLoadedFilter(filterKey);
      });

    return () => {
      active = false;
    };
  }, [filterKey, query, type]);

  function getAvatarColor(companyName = "") {
    const colors = [
      "from-blue-600 to-indigo-600 text-white",
      "from-purple-600 to-indigo-600 text-white",
      "from-emerald-600 to-teal-600 text-white",
      "from-amber-500 to-orange-600 text-white",
      "from-pink-600 to-rose-600 text-white",
    ];
    let hash = 0;
    for (let i = 0; i < companyName.length; i++) {
      hash = companyName.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  }

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-[#090D16] px-4 py-10 text-slate-900 dark:text-white sm:px-6 md:px-12 lg:px-16 transition-colors duration-200">
      <div className="mx-auto max-w-7xl">
        {/* Header Header Banner */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 dark:border-slate-800/80 pb-8">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-200/80 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 dark:border-cyan-500/20 dark:bg-cyan-500/10 dark:text-cyan-400 mb-3">
              <Sparkles className="h-3 w-3" />
              <span>Verified Career Marketplace</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Explore opportunities
            </h1>
            <p className="mt-2 text-slate-600 dark:text-slate-400 text-sm sm:text-base">
              Find roles that fit your goals.
            </p>
          </div>

          {!loading && !error && (
            <div className="flex items-center gap-2 text-xs font-medium text-slate-600 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-xs w-fit dark:bg-slate-900/60 dark:border-slate-800 dark:text-slate-400">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>{jobs.length} active opportunities</span>
            </div>
          )}
        </div>

        {/* Search & Filter Bar */}
        <div className="mt-8 space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row">
            {/* Search Input with Icon & Clear */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search title, company, or description"
                className="w-full rounded-xl border border-slate-200 bg-white pl-11 pr-10 py-3.5 text-sm sm:text-base text-slate-900 placeholder-slate-400 shadow-xs transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700/80 dark:bg-slate-900/90 dark:text-white dark:placeholder-slate-400 dark:focus:border-cyan-400 dark:focus:ring-cyan-400/20"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Select Box for Job Type */}
            <div className="relative sm:w-60">
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm sm:text-base text-slate-900 shadow-xs focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700/80 dark:bg-slate-900/90 dark:text-white dark:focus:border-cyan-400 dark:focus:ring-cyan-400/20"
              >
                {jobTypeOptions.map((opt) => (
                  <option key={opt.value} value={opt.value} className="bg-white text-slate-900 dark:bg-slate-900 dark:text-white">
                    {opt.label}
                  </option>
                ))}
              </select>
              <SlidersHorizontal className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* Quick Filter Pill Buttons */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 mr-1">
              Quick filters:
            </span>
            {jobTypeOptions.map((opt) => {
              const active = type === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setType(opt.value)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                    active
                      ? "bg-blue-600 text-white font-bold shadow-xs dark:bg-cyan-500 dark:text-slate-950 dark:shadow-cyan-500/20"
                      : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-300 dark:hover:border-slate-700 dark:hover:bg-slate-800"
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="mt-8">
            <p className="text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <span className="h-4 w-4 rounded-full border-2 border-blue-600 border-t-transparent animate-spin dark:border-cyan-400" />
              Loading jobs...
            </p>
            {/* Skeleton Cards */}
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="animate-pulse rounded-2xl border border-slate-200 bg-white p-6 space-y-4 shadow-xs dark:border-slate-800 dark:bg-slate-900/50">
                  <div className="h-4 w-28 bg-slate-200 dark:bg-slate-800 rounded" />
                  <div className="h-6 w-3/4 bg-slate-200 dark:bg-slate-800 rounded" />
                  <div className="h-4 w-1/2 bg-slate-200 dark:bg-slate-800 rounded" />
                  <div className="h-16 w-full bg-slate-100 dark:bg-slate-800/60 rounded" />
                  <div className="flex gap-2 pt-2">
                    <div className="h-6 w-16 bg-slate-200 dark:bg-slate-800 rounded-full" />
                    <div className="h-6 w-20 bg-slate-200 dark:bg-slate-800 rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="mt-8 rounded-2xl border border-rose-200 bg-rose-50 p-5 text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300">
            <p className="font-semibold text-rose-600 dark:text-rose-400">Failed to load opportunities</p>
            <p className="mt-1 text-sm">{error}</p>
          </div>
        )}

        {/* Job Listings Grid */}
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {!loading &&
            !error &&
            jobs.map((job) => {
              const skillsList = Array.isArray(job.skills) ? job.skills : [];
              const avatarColor = getAvatarColor(job.company || "Company");
              const initial = (job.company || "C").charAt(0).toUpperCase();

              return (
                <article
                  key={job._id}
                  className="group relative flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-400 hover:shadow-md dark:border-slate-800/90 dark:bg-slate-900/70 dark:hover:border-cyan-500/40 dark:hover:bg-slate-900/95 dark:hover:shadow-xl dark:hover:shadow-cyan-500/10"
                >
                  <div>
                    {/* Top Company & Meta Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${avatarColor} text-base font-extrabold shadow-xs`}
                        >
                          {initial}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-blue-600 dark:text-cyan-400 flex items-center gap-1.5">
                            {job.company}
                            <CheckCircle className="h-3.5 w-3.5 text-blue-600 dark:text-cyan-400" />
                          </p>
                          <h2 className="mt-1 text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors dark:text-white dark:group-hover:text-cyan-300">
                            {job.title}
                          </h2>
                        </div>
                      </div>

                      {job.workMode && (
                        <span className="shrink-0 rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1 text-xs capitalize text-slate-700 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-300">
                          {job.workMode}
                        </span>
                      )}
                    </div>

                    {/* Meta info matching test assertions */}
                    <p className="mt-3 text-sm text-slate-600 dark:text-slate-400 flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span>
                        {job.location} · {job.employmentType || job.jobType}
                      </span>
                    </p>

                    {/* Salary badge if available */}
                    {job.salary && (job.salary.min != null || job.salary.max != null) && (
                      <p className="mt-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <DollarSign className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                        <span>
                          {job.salary.currency || "INR"} {job.salary.min ?? "—"} - {job.salary.max ?? "—"} / {job.salary.period || "year"}
                        </span>
                      </p>
                    )}

                    {/* Job Description */}
                    <p className="mt-4 line-clamp-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                      {job.description}
                    </p>

                    {/* Skills pills */}
                    {skillsList.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-1.5">
                        {skillsList.map((skill) => (
                          <span
                            key={skill}
                            className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700 transition-colors dark:border-slate-800 dark:bg-slate-800/70 dark:text-slate-300 dark:group-hover:border-slate-700"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Card Footer / View Details Link */}
                  <div className="mt-6 flex items-center justify-between border-t border-slate-100 dark:border-slate-800/70 pt-4">
                    <span className="text-xs text-slate-500">
                      {job.experienceLevel ? (
                        <span className="capitalize">{job.experienceLevel} level</span>
                      ) : (
                        "Open to all applicants"
                      )}
                    </span>
                    <Link
                      to={`/jobs/${job._id}`}
                      className="inline-flex items-center gap-1 font-bold text-blue-600 hover:text-blue-500 transition-colors text-sm dark:text-cyan-400 dark:hover:text-cyan-300"
                    >
                      View details →
                    </Link>
                  </div>
                </article>
              );
            })}
        </div>

        {/* Empty state */}
        {!loading && !error && jobs.length === 0 && (
          <div className="mt-12 rounded-3xl border border-slate-200 bg-white p-12 text-center max-w-lg mx-auto shadow-xs dark:border-slate-800 dark:bg-slate-900/50">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500 mb-4 dark:bg-slate-800 dark:text-slate-400">
              <Search className="h-7 w-7" />
            </div>
            <p className="text-lg font-bold text-slate-900 dark:text-white">No jobs match these filters.</p>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Try adjusting your search terms, changing the job type filter, or clear all filters to see everything.
            </p>
            {(query || type) && (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setType("");
                }}
                className="mt-6 rounded-xl bg-blue-50 border border-blue-200 px-5 py-2.5 text-xs font-bold text-blue-700 hover:bg-blue-100 transition-all dark:bg-cyan-500/10 dark:border-cyan-500/30 dark:text-cyan-300 dark:hover:bg-cyan-500/20"
              >
                Clear all filters
              </button>
            )}
          </div>
        )}
      </div>
    </main>
  );
}