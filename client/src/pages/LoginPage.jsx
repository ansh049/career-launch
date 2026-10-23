import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Briefcase, Mail, Lock, ArrowRight, Sparkles, AlertCircle } from "lucide-react";
import { loginUser } from "../features/auth/authSlice";

export default function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { loading, error } = useSelector((state) => state.auth);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function submit(event) {
    event.preventDefault();

    try {
      const user = await dispatch(
        loginUser({ email, password })
      ).unwrap();

      const fallback = user.role === "recruiter" ? "/recruiter" : "/dashboard";
      navigate(location.state?.from || fallback, { replace: true });
    } catch {
      // Redux stores the API error for display.
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center bg-slate-50 dark:bg-[#090D16] px-4 py-12 text-slate-900 dark:text-white overflow-hidden transition-colors">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-500/10 dark:bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md">
        {/* Brand Card */}
        <form
          onSubmit={submit}
          className="space-y-6 rounded-3xl border border-slate-200 dark:border-slate-800/90 bg-white/90 dark:bg-slate-900/80 p-8 sm:p-10 shadow-xl dark:shadow-2xl backdrop-blur-2xl transition-colors"
        >
          <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 dark:from-cyan-500 dark:to-blue-600 shadow-md shadow-blue-500/20 dark:shadow-cyan-500/25 mb-4">
              <Briefcase className="h-6 w-6 text-white dark:text-slate-950 font-bold" />
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Welcome back
            </h1>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Sign in to your CareerLaunch account.
            </p>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
              <span className="mb-1.5 block">Email</span>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500 pointer-events-none" />
                <input
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700/80 bg-slate-50/70 dark:bg-slate-950/80 pl-10 pr-4 py-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 transition-all focus:border-blue-500 dark:focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-cyan-400/20"
                />
              </div>
            </label>

            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
              <span className="mb-1.5 block">Password</span>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500 pointer-events-none" />
                <input
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700/80 bg-slate-50/70 dark:bg-slate-950/80 pl-10 pr-4 py-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 transition-all focus:border-blue-500 dark:focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-cyan-400/20"
                />
              </div>
            </label>
          </div>

          {/* Error Message */}
          {error && (
            <div role="alert" className="flex items-center gap-2 rounded-xl border border-rose-300 dark:border-rose-500/30 bg-rose-50 dark:bg-rose-500/10 p-3.5 text-xs text-rose-700 dark:text-rose-300">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-500 dark:text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-cyan-400 dark:to-blue-500 p-3.5 text-sm font-bold text-white dark:text-slate-950 shadow-md shadow-blue-500/20 dark:shadow-cyan-400/20 hover:from-blue-500 hover:to-indigo-500 dark:hover:from-cyan-300 dark:hover:to-blue-400 disabled:opacity-50 transition-all cursor-pointer"
          >
            <span>{loading ? "Signing in..." : "Sign in"}</span>
            {!loading && <ArrowRight className="h-4 w-4" />}
          </button>

          {/* Footer Navigation */}
          <p className="text-center text-sm text-slate-500 dark:text-slate-400">
            New here?{" "}
            <Link className="font-semibold text-blue-600 dark:text-cyan-400 hover:text-blue-500 dark:hover:text-cyan-300 hover:underline" to="/register">
              Create an account
            </Link>
          </p>
        </form>
      </div>
    </main>
  );
}