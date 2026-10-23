import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Briefcase,
  User,
  Mail,
  Lock,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  AlertCircle
} from "lucide-react";
import { registerUser } from "../features/auth/authSlice";

export default function RegisterPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "candidate",
  });

  function update(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  function setRole(roleValue) {
    setForm((current) => ({ ...current, role: roleValue }));
  }

  async function submit(event) {
    event.preventDefault();

    try {
      const user = await dispatch(registerUser(form)).unwrap();
      navigate(user.role === "recruiter" ? "/recruiter" : "/dashboard");
    } catch {
      // Redux stores the API error for display.
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center bg-slate-50 dark:bg-[#090D16] px-4 py-12 text-slate-900 dark:text-white overflow-hidden transition-colors">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-blue-500/10 dark:bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-lg">
        <form
          onSubmit={submit}
          className="space-y-6 rounded-3xl border border-slate-200 dark:border-slate-800/90 bg-white/90 dark:bg-slate-900/80 p-8 sm:p-10 shadow-xl dark:shadow-2xl backdrop-blur-2xl transition-colors"
        >
          <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 dark:from-cyan-500 dark:to-blue-600 shadow-md shadow-blue-500/20 dark:shadow-cyan-500/25 mb-4">
              <Briefcase className="h-6 w-6 text-white dark:text-slate-950 font-bold" />
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Create your account
            </h1>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Join CareerLaunch to accelerate your journey.
            </p>
          </div>

          {/* Role Selection Interactive Pills */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setRole("candidate")}
              className={`flex flex-col items-center gap-1.5 rounded-2xl border p-4 text-center transition-all cursor-pointer ${
                form.role === "candidate"
                  ? "border-blue-500 bg-blue-50 text-blue-700 dark:border-cyan-400 dark:bg-cyan-500/10 dark:text-cyan-300 shadow-sm"
                  : "border-slate-200 bg-slate-50/70 text-slate-600 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-400 dark:hover:border-slate-700"
              }`}
            >
              <User className="h-5 w-5" />
              <span className="text-xs font-bold">Candidate</span>
              <span className="text-[10px] text-slate-500">Find jobs & internships</span>
            </button>

            <button
              type="button"
              onClick={() => setRole("recruiter")}
              className={`flex flex-col items-center gap-1.5 rounded-2xl border p-4 text-center transition-all cursor-pointer ${
                form.role === "recruiter"
                  ? "border-blue-500 bg-blue-50 text-blue-700 dark:border-cyan-400 dark:bg-cyan-500/10 dark:text-cyan-300 shadow-sm"
                  : "border-slate-200 bg-slate-50/70 text-slate-600 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-400 dark:hover:border-slate-700"
              }`}
            >
              <ShieldCheck className="h-5 w-5" />
              <span className="text-xs font-bold">Recruiter</span>
              <span className="text-[10px] text-slate-500">Post & hire talent</span>
            </button>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
              <span className="mb-1.5 block">Full name</span>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500 pointer-events-none" />
                <input
                  name="name"
                  value={form.name}
                  onChange={update}
                  required
                  minLength={2}
                  maxLength={80}
                  placeholder="Alex Morgan"
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700/80 bg-slate-50/70 dark:bg-slate-950/80 pl-10 pr-4 py-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 transition-all focus:border-blue-500 dark:focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-cyan-400/20"
                />
              </div>
            </label>

            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
              <span className="mb-1.5 block">Email</span>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500 pointer-events-none" />
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={update}
                  required
                  placeholder="alex@example.com"
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700/80 bg-slate-50/70 dark:bg-slate-950/80 pl-10 pr-4 py-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 transition-all focus:border-blue-500 dark:focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-cyan-400/20"
                />
              </div>
            </label>

            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
              <span className="mb-1.5 block">Password (at least 10 characters)</span>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500 pointer-events-none" />
                <input
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  value={form.password}
                  onChange={update}
                  required
                  minLength={10}
                  maxLength={72}
                  placeholder="••••••••••••"
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700/80 bg-slate-50/70 dark:bg-slate-950/80 pl-10 pr-4 py-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 transition-all focus:border-blue-500 dark:focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-cyan-400/20"
                />
              </div>
            </label>

            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
              <span className="mb-1.5 block">Account type</span>
              <select
                name="role"
                value={form.role}
                onChange={update}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700/80 bg-slate-50/70 dark:bg-slate-950/80 px-4 py-3 text-sm text-slate-900 dark:text-white focus:border-blue-500 dark:focus:border-cyan-400 focus:outline-none"
              >
                <option value="candidate">Candidate</option>
                <option value="recruiter">Recruiter</option>
              </select>
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
            <span>{loading ? "Creating account..." : "Create account"}</span>
            {!loading && <ArrowRight className="h-4 w-4" />}
          </button>

          {/* Footer Link */}
          <p className="text-center text-sm text-slate-500 dark:text-slate-400">
            Already registered?{" "}
            <Link className="font-semibold text-blue-600 dark:text-cyan-400 hover:text-blue-500 dark:hover:text-cyan-300 hover:underline" to="/login">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </main>
  );
}