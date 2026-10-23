import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Search,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Code2,
  Cpu,
  Palette,
  Server,
  Smartphone,
  CheckCircle2,
  Users,
  Building2,
  Briefcase
} from "lucide-react";

const popularRoles = [
  { name: "Frontend Engineer", icon: Code2, count: "340+ roles", color: "from-blue-500/10 to-indigo-500/10 text-blue-600 dark:from-cyan-500/20 dark:to-blue-500/20 dark:text-cyan-400" },
  { name: "AI & Machine Learning", icon: Cpu, count: "210+ roles", color: "from-purple-500/10 to-indigo-500/10 text-purple-600 dark:from-purple-500/20 dark:to-indigo-500/20 dark:text-purple-400" },
  { name: "Full Stack Developer", icon: Server, count: "480+ roles", color: "from-emerald-500/10 to-teal-500/10 text-emerald-600 dark:from-emerald-500/20 dark:to-teal-500/20 dark:text-emerald-400" },
  { name: "UI/UX & Product Design", icon: Palette, count: "160+ roles", color: "from-pink-500/10 to-rose-500/10 text-pink-600 dark:from-pink-500/20 dark:to-rose-500/20 dark:text-pink-400" },
  { name: "Mobile App Developer", icon: Smartphone, count: "190+ roles", color: "from-amber-500/10 to-orange-500/10 text-amber-600 dark:from-amber-500/20 dark:to-orange-500/20 dark:text-amber-400" },
  { name: "DevOps & Cloud Engineer", icon: ShieldCheck, count: "230+ roles", color: "from-sky-500/10 to-blue-500/10 text-sky-600 dark:from-sky-500/20 dark:to-cyan-500/20 dark:text-sky-400" },
];

const perks = [
  {
    title: "AI-Powered Skill Match",
    description: "Get smart semantic scoring comparing your resume directly to job requirements.",
    icon: Sparkles,
  },
  {
    title: "Direct Recruiter Visibility",
    description: "Your applications reach verified hiring managers directly without resume black holes.",
    icon: Users,
  },
  {
    title: "Real-time Status Tracking",
    description: "Track application milestones from submitted, reviewing, shortlisted to hired.",
    icon: CheckCircle2,
  },
];

export default function HomePage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  function handleSearch(e) {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/jobs?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate("/jobs");
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 overflow-hidden transition-colors duration-200 dark:bg-[#090D16] dark:text-white">
      {/* Background ambient glow effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[450px] bg-gradient-to-b from-blue-500/10 via-indigo-500/5 to-transparent blur-3xl pointer-events-none dark:from-cyan-500/10 dark:via-indigo-500/5" />

      {/* Hero Section */}
      <section className="relative mx-auto max-w-7xl px-4 pt-16 pb-20 sm:px-6 sm:pt-24 sm:pb-28 lg:px-8 text-center">
        {/* Top Tag Pill */}
        <div className="inline-flex items-center gap-2 rounded-full border border-blue-200/80 bg-blue-50 px-4 py-1.5 text-xs font-semibold text-blue-700 shadow-xs mb-8 animate-fade-in dark:border-cyan-500/30 dark:bg-cyan-500/10 dark:text-cyan-300 dark:shadow-cyan-500/20">
          <Sparkles className="h-3.5 w-3.5 text-blue-600 dark:text-cyan-400" />
          <span>Next-Generation Career & Internship Portal</span>
        </div>

        {/* Primary Heading */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-slate-900 max-w-4xl mx-auto leading-[1.1] dark:text-white">
          Launch your career with{" "}
          <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-600 bg-clip-text text-transparent dark:from-cyan-400 dark:via-sky-300 dark:to-indigo-400">
            CareerLaunch
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mt-6 max-w-2xl mx-auto text-base sm:text-lg text-slate-600 leading-relaxed dark:text-slate-300">
          Find internships, build skills, and advance your career. Connect directly with forward-thinking tech employers, receive AI matching scores, and track your applications end-to-end.
        </p>

        {/* Interactive Search Bar */}
        <form onSubmit={handleSearch} className="mt-10 mx-auto max-w-2xl">
          <div className="relative flex items-center rounded-2xl border border-slate-200 bg-white p-2 shadow-lg shadow-slate-200/50 backdrop-blur-xl transition-all focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 dark:border-slate-700/80 dark:bg-slate-900/90 dark:shadow-2xl dark:focus-within:border-cyan-400 dark:focus-within:ring-cyan-400/20">
            <Search className="ml-3 h-5 w-5 text-slate-400 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, skill (e.g. React, Python), or company..."
              className="w-full bg-transparent px-3 py-2 text-sm sm:text-base text-slate-900 placeholder-slate-400 focus:outline-none dark:text-white dark:placeholder-slate-500"
            />
            <button
              type="submit"
              className="flex shrink-0 items-center gap-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 font-bold text-white shadow-md shadow-blue-500/20 hover:from-blue-500 hover:to-indigo-500 transition-all text-sm dark:from-cyan-400 dark:to-blue-500 dark:text-slate-950 dark:shadow-cyan-500/25"
            >
              <span>Search</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </form>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-wrap justify-center items-center gap-4">
          <Link
            to="/jobs"
            className="rounded-xl bg-blue-600 px-6 py-3.5 font-bold text-white shadow-md shadow-blue-500/20 hover:bg-blue-500 hover:scale-[1.02] transition-all flex items-center gap-2 dark:bg-cyan-400 dark:text-slate-950 dark:shadow-cyan-400/20 dark:hover:bg-cyan-300"
          >
            <Briefcase className="h-4 w-4" />
            Browse jobs
          </Link>
          <Link
            to="/register"
            className="rounded-xl border border-slate-200 bg-white px-6 py-3.5 font-semibold text-slate-700 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 transition-all shadow-xs flex items-center gap-2 dark:border-slate-700/80 dark:bg-slate-900/60 dark:text-slate-200 dark:hover:border-cyan-400 dark:hover:bg-slate-800/80 dark:hover:text-white"
          >
            <Users className="h-4 w-4" />
            Create account
          </Link>
        </div>

        {/* Quick Metrics Cards */}
        <div className="mt-16 grid grid-cols-2 gap-4 sm:grid-cols-4 max-w-4xl mx-auto">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-xs backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-900/60">
            <p className="text-2xl sm:text-3xl font-extrabold text-blue-600 dark:text-cyan-400">1,500+</p>
            <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">Active Roles</p>
          </div>
          <div className="rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-xs backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-900/60">
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">98%</p>
            <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">Verified Companies</p>
          </div>
          <div className="rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-xs backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-900/60">
            <p className="text-2xl sm:text-3xl font-extrabold text-blue-600 dark:text-cyan-400">24h</p>
            <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">Avg Response Time</p>
          </div>
          <div className="rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-xs backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-900/60">
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">Free</p>
            <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">For Candidates</p>
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Explore Popular Categories
            </h2>
            <p className="mt-2 text-slate-600 dark:text-slate-400">
              High-growth technical disciplines recruiting active applicants now.
            </p>
          </div>
          <Link
            to="/jobs"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-500 dark:text-cyan-400 dark:hover:text-cyan-300"
          >
            <span>View all roles</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {popularRoles.map((role) => {
            const Icon = role.icon;
            return (
              <Link
                key={role.name}
                to={`/jobs?q=${encodeURIComponent(role.name.split(" ")[0])}`}
                className="group relative flex items-center gap-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-blue-400 hover:shadow-md dark:border-slate-800/80 dark:bg-slate-900/50 dark:hover:border-cyan-500/40 dark:hover:bg-slate-900/90 dark:hover:shadow-xl dark:hover:shadow-cyan-500/10"
              >
                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${role.color}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors dark:text-white dark:group-hover:text-cyan-400">
                    {role.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5 dark:text-slate-400">{role.count}</p>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-400 transition-transform group-hover:translate-x-1 group-hover:text-blue-600 dark:group-hover:text-cyan-400" />
              </Link>
            );
          })}
        </div>
      </section>

      {/* Platform Advantage / Perks */}
      <section className="border-t border-slate-200 bg-slate-100/60 py-20 transition-colors dark:border-slate-800/80 dark:bg-slate-950/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Why Job Seekers & Tech Talent Choose CareerLaunch
            </h2>
            <p className="mt-3 text-slate-600 dark:text-slate-400">
              Modern tooling engineered to bypass traditional hiring hurdles.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {perks.map((perk) => {
              const Icon = perk.icon;
              return (
                <div
                  key={perk.title}
                  className="rounded-2xl border border-slate-200/80 bg-white p-8 shadow-xs backdrop-blur-sm transition-all hover:shadow-md hover:border-slate-300 dark:border-slate-800/80 dark:bg-slate-900/60 dark:hover:border-slate-700"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-200/80 mb-6 dark:bg-cyan-500/10 dark:text-cyan-400 dark:border-cyan-500/20">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">{perk.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-400">
                    {perk.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Employer CTA Banner */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl border border-blue-200 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-950 p-8 sm:p-12 text-white shadow-xl dark:border-cyan-500/30 dark:from-slate-900 dark:via-slate-900/90 dark:to-cyan-950/40">
          <div className="relative z-10 max-w-2xl">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-blue-300 dark:text-cyan-400">
              <Building2 className="h-4 w-4" /> Hiring Teams
            </span>
            <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              Looking to hire top technical candidates?
            </h2>
            <p className="mt-4 text-blue-100/90 text-sm sm:text-base leading-relaxed dark:text-slate-300">
              Post internships, junior, and experienced engineering roles. Manage applicants, review PDF resumes, and update hiring statuses instantly in one unified dashboard.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                to="/register"
                className="rounded-xl bg-white px-6 py-3 font-bold text-slate-900 shadow-md hover:bg-slate-100 transition-all dark:bg-cyan-400 dark:text-slate-950 dark:hover:bg-cyan-300"
              >
                Start Hiring Now
              </Link>
              <Link
                to="/recruiter"
                className="rounded-xl border border-white/30 px-6 py-3 font-semibold text-white hover:bg-white/10 transition-all dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                Recruiter Portal
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
