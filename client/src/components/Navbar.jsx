import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  Briefcase,
  Sparkles,
  Compass,
  FileText,
  PlusCircle,
  Menu,
  X,
  User,
  ShieldCheck,
  ChevronDown,
  Sun,
  Moon,
  BrainCircuit,
  Map,
  Bot,
  ClipboardList,
  MessageSquare,
  ShieldAlert
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import LogoutButton from "./LogoutButton";

export default function Navbar() {
  const { user } = useSelector((state) => state.auth);
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [aiDropdownOpen, setAiDropdownOpen] = useState(false);
  const aiDropdownRef = useRef(null);

  const isActive = (path) => location.pathname === path;
  const isAiActive = () =>
    [
      "/recommendations",
      "/roadmap",
      "/resume-copilot",
      "/interview",
      "/tracker",
      "/assistant",
      "/approvals",
      "/analytics",
      "/career-graph",
    ].some((p) => location.pathname.startsWith(p));

  // Close AI dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (aiDropdownRef.current && !aiDropdownRef.current.contains(e.target)) {
        setAiDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/90 backdrop-blur-xl transition-all shadow-xs dark:border-slate-800/80 dark:bg-[#090D16]/90">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        {/* Brand / Logo */}
        <Link to="/" className="group flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 shadow-md shadow-blue-500/20 transition-transform group-hover:scale-105 dark:from-cyan-500 dark:to-blue-600 dark:shadow-cyan-500/20">
            <Briefcase className="h-5 w-5 text-white dark:text-slate-950 font-bold" />
          </div>
          <div>
            <span className="text-xl font-extrabold tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors dark:text-white dark:group-hover:text-cyan-400">
              Career<span className="text-blue-600 dark:text-cyan-400">Launch</span>
            </span>
            <span className="hidden text-[10px] uppercase font-bold tracking-widest text-blue-600 dark:text-cyan-400 sm:block">
              Portal
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden items-center gap-1 md:flex">
          <Link
            to="/jobs"
            className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition-all ${
              isActive("/jobs")
                ? "bg-blue-50 text-blue-600 border border-blue-200/80 dark:bg-cyan-500/10 dark:text-cyan-400 dark:border-cyan-500/30"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/60 dark:hover:text-white"
            }`}
          >
            <Compass className="h-4 w-4" />
            Explore Jobs
          </Link>

          <Link
            to="/market"
            className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition-all ${
              isActive("/market")
                ? "bg-blue-50 text-blue-600 border border-blue-200/80 dark:bg-cyan-500/10 dark:text-cyan-400 dark:border-cyan-500/30"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/60 dark:hover:text-white"
            }`}
          >
            <Sparkles className="h-4 w-4 text-emerald-500" />
            Market Trends
          </Link>

          <Link
            to="/career-graph"
            className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition-all ${
              isActive("/career-graph")
                ? "bg-blue-50 text-blue-600 border border-blue-200/80 dark:bg-cyan-500/10 dark:text-cyan-400 dark:border-cyan-500/30"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/60 dark:hover:text-white"
            }`}
          >
            <Map className="h-4 w-4 text-indigo-500" />
            Skill Graph
          </Link>

          {user?.role === "candidate" && (
            <>
              <Link
                to="/profile"
                className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition-all ${
                  isActive("/profile")
                    ? "bg-blue-50 text-blue-600 border border-blue-200/80 dark:bg-cyan-500/10 dark:text-cyan-400 dark:border-cyan-500/30"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/60 dark:hover:text-white"
                }`}
              >
                <Sparkles className="h-4 w-4 text-blue-600 dark:text-cyan-400" />
                AI Profile
              </Link>

              {/* AI Tools Dropdown */}
              <div className="relative" ref={aiDropdownRef}>
                <button
                  type="button"
                  onClick={() => setAiDropdownOpen(!aiDropdownOpen)}
                  className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition-all cursor-pointer ${
                    isAiActive()
                      ? "bg-blue-50 text-blue-600 border border-blue-200/80 dark:bg-cyan-500/10 dark:text-cyan-400 dark:border-cyan-500/30"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/60 dark:hover:text-white"
                  }`}
                >
                  <BrainCircuit className="h-4 w-4" />
                  AI Tools
                  <ChevronDown className={`h-3.5 w-3.5 transition-transform ${aiDropdownOpen ? "rotate-180" : ""}`} />
                </button>

                {aiDropdownOpen && (
                  <div className="absolute left-0 top-full mt-2 w-56 rounded-xl border border-slate-200 bg-white p-2 shadow-xl backdrop-blur-xl z-50 dark:border-slate-800 dark:bg-slate-900/95">
                    <Link to="/recommendations" onClick={() => setAiDropdownOpen(false)}
                      className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${
                        isActive("/recommendations") ? "text-blue-600 dark:text-cyan-400" : "text-slate-700 dark:text-slate-300"
                      }`}>
                      <Sparkles className="h-3.5 w-3.5 text-blue-600 dark:text-cyan-400" />
                      AI Job Matches
                    </Link>
                    <Link to="/roadmap" onClick={() => setAiDropdownOpen(false)}
                      className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${
                        isActive("/roadmap") ? "text-blue-600 dark:text-cyan-400" : "text-slate-700 dark:text-slate-300"
                      }`}>
                      <Map className="h-3.5 w-3.5 text-blue-600 dark:text-cyan-400" />
                      Career Roadmap
                    </Link>
                    <Link to="/resume-copilot" onClick={() => setAiDropdownOpen(false)}
                      className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${
                        isActive("/resume-copilot") ? "text-blue-600 dark:text-cyan-400" : "text-slate-700 dark:text-slate-300"
                      }`}>
                      <FileText className="h-3.5 w-3.5 text-blue-600 dark:text-cyan-400" />
                      Resume Copilot
                    </Link>
                    <Link to="/interview" onClick={() => setAiDropdownOpen(false)}
                      className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${
                        location.pathname.startsWith("/interview") ? "text-blue-600 dark:text-cyan-400" : "text-slate-700 dark:text-slate-300"
                      }`}>
                      <MessageSquare className="h-3.5 w-3.5 text-blue-600 dark:text-cyan-400" />
                      Interview Prep
                    </Link>
                    <Link to="/analytics" onClick={() => setAiDropdownOpen(false)}
                      className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${
                        isActive("/analytics") ? "text-blue-600 dark:text-cyan-400" : "text-slate-700 dark:text-slate-300"
                      }`}>
                      <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
                      Career Analytics
                    </Link>
                    <div className="my-1 border-t border-slate-100 dark:border-slate-800" />
                    <Link to="/assistant" onClick={() => setAiDropdownOpen(false)}
                      className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${
                        isActive("/assistant") ? "text-blue-600 dark:text-cyan-400" : "text-slate-700 dark:text-slate-300"
                      }`}>
                      <Bot className="h-3.5 w-3.5 text-blue-600 dark:text-cyan-400" />
                      Career Assistant
                    </Link>
                    <Link to="/approvals" onClick={() => setAiDropdownOpen(false)}
                      className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${
                        isActive("/approvals") ? "text-amber-600 dark:text-amber-400" : "text-slate-700 dark:text-slate-300"
                      }`}>
                      <ShieldAlert className="h-3.5 w-3.5 text-amber-500" />
                      Approval Queue
                    </Link>
                  </div>
                )}
              </div>

              <Link
                to="/tracker"
                className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition-all ${
                  isActive("/tracker")
                    ? "bg-blue-50 text-blue-600 border border-blue-200/80 dark:bg-cyan-500/10 dark:text-cyan-400 dark:border-cyan-500/30"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/60 dark:hover:text-white"
                }`}
              >
                <ClipboardList className="h-4 w-4" />
                Tracker
              </Link>
              <Link
                to="/dashboard"
                className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition-all ${
                  isActive("/dashboard")
                    ? "bg-blue-50 text-blue-600 border border-blue-200/80 dark:bg-cyan-500/10 dark:text-cyan-400 dark:border-cyan-500/30"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/60 dark:hover:text-white"
                }`}
              >
                <User className="h-4 w-4" />
                Dashboard
              </Link>
            </>
          )}

          {user?.role === "recruiter" && (
            <>
              <Link
                to="/recruiter"
                className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition-all ${
                  isActive("/recruiter")
                    ? "bg-blue-50 text-blue-600 border border-blue-200/80 dark:bg-cyan-500/10 dark:text-cyan-400 dark:border-cyan-500/30"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/60 dark:hover:text-white"
                }`}
              >
                <ShieldCheck className="h-4 w-4" />
                Recruiter Hub
              </Link>
              <Link
                to="/recruiter/jobs"
                className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition-all ${
                  isActive("/recruiter/jobs")
                    ? "bg-blue-50 text-blue-600 border border-blue-200/80 dark:bg-cyan-500/10 dark:text-cyan-400 dark:border-cyan-500/30"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/60 dark:hover:text-white"
                }`}
              >
                <Briefcase className="h-4 w-4" />
                Manage Jobs
              </Link>
              <Link
                to="/recruiter/intelligence"
                className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition-all ${
                  isActive("/recruiter/intelligence")
                    ? "bg-blue-50 text-blue-600 border border-blue-200/80 dark:bg-cyan-500/10 dark:text-cyan-400 dark:border-cyan-500/30"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/60 dark:hover:text-white"
                }`}
              >
                <BrainCircuit className="h-4 w-4 text-blue-600 dark:text-cyan-400" />
                AI Copilot
              </Link>
              <Link
                to="/recruiter/analytics"
                className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition-all ${
                  isActive("/recruiter/analytics")
                    ? "bg-blue-50 text-blue-600 border border-blue-200/80 dark:bg-cyan-500/10 dark:text-cyan-400 dark:border-cyan-500/30"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/60 dark:hover:text-white"
                }`}
              >
                <Sparkles className="h-4 w-4 text-indigo-500" />
                Analytics
              </Link>
              <Link
                to="/recruiter/jobs/new"
                className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-3.5 py-2 text-sm font-semibold text-white shadow-sm shadow-blue-500/20 hover:from-blue-500 hover:to-indigo-500 transition-all ml-1 dark:from-cyan-500 dark:to-blue-600 dark:text-slate-950"
              >
                <PlusCircle className="h-4 w-4" />
                Post Job
              </Link>
            </>
          )}
        </nav>

        {/* Right side: Theme Toggle & Auth Controls / User Profile */}
        <div className="hidden items-center gap-3 md:flex">
          {/* Theme Toggle Button */}
          <button
            type="button"
            onClick={toggleTheme}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-700 shadow-xs hover:bg-slate-100 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white transition-all cursor-pointer"
            title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            aria-label="Toggle dark mode"
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4 text-amber-400 transition-transform hover:rotate-45" />
            ) : (
              <Moon className="h-4 w-4 text-slate-600 transition-transform hover:-rotate-12" />
            )}
          </button>

          {user ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-left text-sm text-slate-800 hover:border-slate-300 shadow-xs transition-all dark:border-slate-700/80 dark:bg-slate-900/80 dark:text-white dark:hover:border-slate-600"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 font-bold text-white text-xs dark:from-cyan-400 dark:to-indigo-600 dark:text-slate-950">
                  {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-semibold leading-tight line-clamp-1 max-w-[120px]">
                    {user.name || "My Account"}
                  </span>
                  <span className="text-[10px] text-blue-600 dark:text-cyan-400 capitalize">
                    {user.role}
                  </span>
                </div>
                <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
              </button>

              {userDropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-200 bg-white p-2 shadow-xl backdrop-blur-xl z-50 dark:border-slate-800 dark:bg-slate-900/95"
                  onClick={() => setUserDropdownOpen(false)}
                >
                  <div className="border-b border-slate-100 dark:border-slate-800 px-3 py-2 text-xs">
                    <p className="font-semibold text-slate-900 dark:text-white">{user.name}</p>
                    <p className="text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
                  </div>
                  <div className="py-1">
                    <Link
                      to={user.role === "recruiter" ? "/recruiter" : "/dashboard"}
                      className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
                    >
                      <User className="h-3.5 w-3.5 text-blue-600 dark:text-cyan-400" />
                      Dashboard
                    </Link>
                    {user.role === "candidate" && (
                      <>
                        <Link
                          to="/profile"
                          className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
                        >
                          <Sparkles className="h-3.5 w-3.5 text-blue-600 dark:text-cyan-400" />
                          AI Profile & Resume
                        </Link>
                        <Link
                          to="/roadmap"
                          className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
                        >
                          <Map className="h-3.5 w-3.5 text-blue-600 dark:text-cyan-400" />
                          Career Roadmap
                        </Link>
                        <Link
                          to="/resume-copilot"
                          className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
                        >
                          <FileText className="h-3.5 w-3.5 text-blue-600 dark:text-cyan-400" />
                          Resume Copilot
                        </Link>
                        <Link
                          to="/interview"
                          className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
                        >
                          <MessageSquare className="h-3.5 w-3.5 text-blue-600 dark:text-cyan-400" />
                          Interview Prep
                        </Link>
                        <Link
                          to="/tracker"
                          className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
                        >
                          <ClipboardList className="h-3.5 w-3.5 text-blue-600 dark:text-cyan-400" />
                          Application Tracker
                        </Link>
                        <Link
                          to="/applications"
                          className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
                        >
                          <FileText className="h-3.5 w-3.5 text-blue-600 dark:text-cyan-400" />
                          My Applications
                        </Link>
                        <Link
                          to="/assistant"
                          className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
                        >
                          <Bot className="h-3.5 w-3.5 text-blue-600 dark:text-cyan-400" />
                          Career Assistant
                        </Link>
                      </>
                    )}
                  </div>
                  <div className="border-t border-slate-100 dark:border-slate-800 pt-1">
                    <LogoutButton />
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800/60"
              >
                Sign in
              </Link>
              <Link
                to="/register"
                className="rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-sm font-bold text-white shadow-sm shadow-blue-500/20 hover:from-blue-500 hover:to-indigo-500 transition-all hover:scale-[1.02] dark:from-cyan-400 dark:to-blue-500 dark:text-slate-950 dark:shadow-cyan-500/20"
              >
                Create account
              </Link>
            </div>
          )}
        </div>

        {/* Mobile controls: Theme Toggle + Menu Hamburger */}
        <div className="flex items-center gap-2 md:hidden">
          <button
            type="button"
            onClick={toggleTheme}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-700 shadow-xs dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-300"
            aria-label="Toggle dark mode"
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4 text-amber-400" />
            ) : (
              <Moon className="h-4 w-4 text-slate-600" />
            )}
          </button>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="border-b border-slate-200 bg-white/95 px-4 pt-2 pb-6 backdrop-blur-2xl md:hidden dark:border-slate-800 dark:bg-[#090D16]/95">
          <div className="space-y-1">
            <Link
              to="/jobs"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-base font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
            >
              <Compass className="h-5 w-5 text-blue-600 dark:text-cyan-400" />
              Explore Jobs
            </Link>

            {user?.role === "candidate" && (
              <>
                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-base font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
                >
                  <Sparkles className="h-5 w-5 text-blue-600 dark:text-cyan-400" />
                  AI Profile & Resume
                </Link>
                <Link
                  to="/recommendations"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-base font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
                >
                  <Sparkles className="h-5 w-5 text-blue-600 dark:text-cyan-400" />
                  AI Job Matches
                </Link>
                <Link
                  to="/roadmap"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-base font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
                >
                  <Map className="h-5 w-5 text-blue-600 dark:text-cyan-400" />
                  Career Roadmap
                </Link>
                <Link
                  to="/resume-copilot"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-base font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
                >
                  <FileText className="h-5 w-5 text-blue-600 dark:text-cyan-400" />
                  Resume Copilot
                </Link>
                <Link
                  to="/interview"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-base font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
                >
                  <MessageSquare className="h-5 w-5 text-blue-600 dark:text-cyan-400" />
                  Interview Prep
                </Link>
                <Link
                  to="/tracker"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-base font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
                >
                  <ClipboardList className="h-5 w-5 text-blue-600 dark:text-cyan-400" />
                  Application Tracker
                </Link>
                <Link
                  to="/assistant"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-base font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
                >
                  <Bot className="h-5 w-5 text-blue-600 dark:text-cyan-400" />
                  Career Assistant
                </Link>
                <Link
                  to="/approvals"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-base font-medium text-amber-700 hover:bg-amber-50 dark:text-amber-300 dark:hover:bg-amber-950/40"
                >
                  <ShieldAlert className="h-5 w-5 text-amber-500" />
                  Approval Queue
                </Link>
                <Link
                  to="/applications"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-base font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
                >
                  <FileText className="h-5 w-5 text-blue-600 dark:text-cyan-400" />
                  My Applications
                </Link>
                <Link
                  to="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-base font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
                >
                  <User className="h-5 w-5 text-blue-600 dark:text-cyan-400" />
                  Candidate Dashboard
                </Link>
              </>
            )}

            {user?.role === "recruiter" && (
              <>
                <Link
                  to="/recruiter"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-base font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
                >
                  <ShieldCheck className="h-5 w-5 text-blue-600 dark:text-cyan-400" />
                  Recruiter Hub
                </Link>
                <Link
                  to="/recruiter/jobs"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-base font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
                >
                  <Briefcase className="h-5 w-5 text-blue-600 dark:text-cyan-400" />
                  Manage Listings
                </Link>
                <Link
                  to="/recruiter/jobs/new"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-base font-semibold text-blue-600 dark:text-cyan-400"
                >
                  <PlusCircle className="h-5 w-5" />
                  Post New Job
                </Link>
              </>
            )}

            <div className="border-t border-slate-200 dark:border-slate-800 pt-3 mt-3">
              {user ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white font-bold text-xs dark:bg-cyan-400 dark:text-slate-950">
                      {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-900 dark:text-white">{user.name}</p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">{user.email}</p>
                    </div>
                  </div>
                  <LogoutButton />
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex justify-center rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    Sign in
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex justify-center rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-2.5 text-sm font-bold text-white shadow-sm dark:from-cyan-400 dark:to-blue-500 dark:text-slate-950"
                  >
                    Create account
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
