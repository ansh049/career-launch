import { Link } from "react-router-dom";
import { Briefcase, Heart, Sparkles } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white text-slate-600 transition-colors duration-200 dark:border-slate-800/80 dark:bg-[#070A12] dark:text-slate-400">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand Col */}
          <div className="space-y-4 md:col-span-2">
            <Link to="/" className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 dark:from-cyan-500 dark:to-blue-600">
                <Briefcase className="h-5 w-5 text-white dark:text-slate-950 font-bold" />
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                Career<span className="text-blue-600 dark:text-cyan-400">Launch</span>
              </span>
            </Link>
            <p className="max-w-md text-sm leading-6 text-slate-600 dark:text-slate-400">
              The modern career launchpad connecting talented candidates with forward-thinking tech companies. Fast applications, smart AI recommendations, and transparent hiring.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span>Next-Gen Career Intelligence</span>
              <span>•</span>
              <span className="flex items-center gap-1 text-blue-600 dark:text-cyan-400 font-semibold">
                <Sparkles className="h-3 w-3" /> AI-Powered
              </span>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-900 dark:text-slate-200">
              Candidate Links
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <Link to="/jobs" className="hover:text-blue-600 dark:hover:text-cyan-400 transition-colors">
                  Explore All Jobs
                </Link>
              </li>
              <li>
                <Link to="/recommendations" className="hover:text-blue-600 dark:hover:text-cyan-400 transition-colors">
                  AI Skill Matching
                </Link>
              </li>
              <li>
                <Link to="/applications" className="hover:text-blue-600 dark:hover:text-cyan-400 transition-colors">
                  Application Tracker
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-blue-600 dark:hover:text-cyan-400 transition-colors">
                  Candidate Sign Up
                </Link>
              </li>
            </ul>
          </div>

          {/* Recruiter links */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-900 dark:text-slate-200">
              For Employers
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <Link to="/recruiter" className="hover:text-blue-600 dark:hover:text-cyan-400 transition-colors">
                  Recruiter Dashboard
                </Link>
              </li>
              <li>
                <Link to="/recruiter/jobs/new" className="hover:text-blue-600 dark:hover:text-cyan-400 transition-colors">
                  Post an Opportunity
                </Link>
              </li>
              <li>
                <Link to="/recruiter/jobs" className="hover:text-blue-600 dark:hover:text-cyan-400 transition-colors">
                  Manage Listings
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-blue-600 dark:hover:text-cyan-400 transition-colors">
                  Hire Talent
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-slate-200 dark:border-slate-800/80 pt-8 sm:flex-row text-xs text-slate-500">
          <p>© {new Date().getFullYear()} CareerLaunch Inc. All rights reserved.</p>
          <div className="flex items-center gap-6">
         
          </div>
        </div>
      </div>
    </footer>
  );
}
