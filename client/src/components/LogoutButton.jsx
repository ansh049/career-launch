import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { logoutUser } from "../features/auth/authSlice";

export default function LogoutButton({ className = "" }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function logout() {
    setError("");
    setLoading(true);
    try {
      await dispatch(logoutUser()).unwrap();
      navigate("/login", { replace: true });
    } catch (requestError) {
      setError(requestError);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="inline-block">
      <button
        type="button"
        onClick={logout}
        disabled={loading}
        className={`flex items-center gap-1.5 rounded-lg border border-slate-300 dark:border-slate-700/80 bg-white dark:bg-slate-900/60 px-3.5 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 transition-all hover:border-rose-400 hover:bg-rose-50 dark:hover:border-rose-500/50 dark:hover:bg-rose-500/10 hover:text-rose-600 dark:hover:text-rose-300 disabled:opacity-50 shadow-sm cursor-pointer ${className}`}
      >
        <LogOut className="h-3.5 w-3.5" />
        Sign out
      </button>
      {error && (
        <p role="alert" className="mt-1 text-xs text-rose-400">
          {error}
        </p>
      )}
    </div>
  );
}
