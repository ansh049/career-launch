import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { ShieldAlert, Clock, ArrowLeft } from "lucide-react";

export default function ProtectedRoute({ roles }) {
  const { user, initialized } = useSelector((state) => state.auth);
  const location = useLocation();

  if (!initialized) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-[#090D16] p-8 text-slate-900 dark:text-white transition-colors">
        <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
          <span className="h-5 w-5 rounded-full border-2 border-blue-600 dark:border-cyan-400 border-t-transparent animate-spin" />
          <p className="text-slate-900 dark:text-white font-medium">Loading session...</p>
        </div>
      </main>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  if (user.role === "recruiter" && !user.recruiterVerified) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-[#090D16] px-4 py-12 text-slate-900 dark:text-white transition-colors">
        <section
          role="status"
          className="w-full max-w-xl rounded-3xl border border-amber-300 dark:border-amber-500/30 bg-white dark:bg-slate-900/80 p-8 sm:p-10 shadow-xl dark:shadow-2xl backdrop-blur-xl"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20 mb-6">
            <Clock className="h-6 w-6" />
          </div>

          <p className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-cyan-400">
            Account status
          </p>

          <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Recruiter verification pending
          </h1>

          <p className="mt-4 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            Your account is registered, but recruiter access is unavailable
            until verification is complete.
          </p>

          <div className="mt-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 p-4 text-xs text-slate-500 dark:text-slate-400">
            Our compliance team verifies employer accounts within 1 business day. You will receive an email once approved.
          </div>
        </section>
      </main>
    );
  }

  return <Outlet />;
}
