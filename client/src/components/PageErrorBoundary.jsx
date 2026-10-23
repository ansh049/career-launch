import { Component } from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, Home } from "lucide-react";

export default class PageErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Page rendering failed:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <main
          role="alert"
          className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50 dark:bg-[#090D16] px-6 text-center text-slate-900 dark:text-white transition-colors"
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20 mb-2">
            <AlertTriangle className="h-8 w-8" />
          </div>

          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">
            This page could not be loaded
          </h1>

          <p className="max-w-md text-sm text-slate-600 dark:text-slate-300">
            Please try again or return to your dashboard.
          </p>

          <Link
            to="/dashboard"
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-cyan-400 dark:to-blue-500 px-6 py-3 font-bold text-white dark:text-slate-950 shadow-md hover:from-blue-500 hover:to-indigo-500 dark:hover:from-cyan-300 dark:hover:to-blue-400 transition-all text-sm"
            onClick={() => this.setState({ hasError: false })}
          >
            <Home className="h-4 w-4" />
            <span>Return to dashboard</span>
          </Link>
        </main>
      );
    }

    return this.props.children;
  }
}
