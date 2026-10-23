import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useDispatch } from "react-redux";

import { fetchCurrentUser } from "./features/auth/authSlice";
import { ThemeProvider } from "./context/ThemeContext";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import JobsPage from "./pages/JobsPage";
import JobDetailsPage from "./pages/JobDetailsPage";
import CandidateDashboard from "./pages/CandidateDashboard";
import ProfilePage from "./pages/ProfilePage";
import ProtectedRoute from "./components/ProtectedRoute";
import RecruiterDashboard from "./pages/RecruiterDashboard";
import ApplicantsPage from "./pages/ApplicantsPage";
import RecommendationsPage from "./pages/RecommendationsPage";
import ApplyPage from "./pages/ApplyPage";
import RecruiterJobs from "./pages/RecruiterJobs";
import JobForm from "./pages/JobForm";
import MyApplications from "./pages/MyApplications";
import PageErrorBoundary from "./components/PageErrorBoundary";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import CareerRoadmap from "./pages/CareerRoadmap";
import ResumeCopilot from "./pages/ResumeCopilot";
import ApplicationTracker from "./pages/ApplicationTracker";
import InterviewSetup from "./pages/InterviewSetup";
import InterviewSession from "./pages/InterviewSession";
import InterviewFeedback from "./pages/InterviewFeedback";
import CareerAssistant from "./pages/CareerAssistant";
import AgentApprovals from "./pages/AgentApprovals";
import JobSafetyReport from "./pages/JobSafetyReport";
import ModerationQueue from "./pages/ModerationQueue";
import CareerGraph from "./pages/CareerGraph";
import AnalyticsDashboard from "./pages/AnalyticsDashboard";
import MarketIntelligence from "./pages/MarketIntelligence";
import RecruiterIntelligence from "./pages/RecruiterIntelligence";
import CandidateComparison from "./pages/CandidateComparison";

function AppRoutes() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchCurrentUser());
  }, [dispatch]);

  return (
    <PageErrorBoundary>
      <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-[#090D16] text-slate-900 dark:text-slate-100 selection:bg-blue-500/20 selection:text-blue-700 dark:selection:bg-cyan-500/30 dark:selection:text-cyan-200 transition-colors duration-200">
        <Navbar />
        <div className="flex-1">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/jobs" element={<JobsPage />} />
            <Route path="/jobs/:id" element={<JobDetailsPage />} />
            <Route path="/jobs/:id/report" element={<JobSafetyReport />} />
            <Route path="/market" element={<MarketIntelligence />} />
            <Route path="/career-graph" element={<CareerGraph />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            <Route element={<ProtectedRoute roles={["candidate"]} />}>
              <Route path="/dashboard" element={<CandidateDashboard />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/recommendations" element={<RecommendationsPage />} />
              <Route path="/apply/:id" element={<ApplyPage />} />
              <Route path="/applications" element={<MyApplications />} />
              <Route path="/tracker" element={<ApplicationTracker />} />
              <Route path="/roadmap" element={<CareerRoadmap />} />
              <Route path="/resume-copilot" element={<ResumeCopilot />} />
              <Route path="/interview" element={<InterviewSetup />} />
              <Route path="/interview/:id" element={<InterviewSession />} />
              <Route path="/interview/session/:id" element={<InterviewSession />} />
              <Route path="/interview/:id/feedback" element={<InterviewFeedback />} />
              <Route path="/interview/feedback/:id" element={<InterviewFeedback />} />
              <Route path="/assistant" element={<CareerAssistant />} />
              <Route path="/approvals" element={<AgentApprovals />} />
              <Route path="/analytics" element={<AnalyticsDashboard />} />
            </Route>

            <Route element={<ProtectedRoute roles={["recruiter"]} />}>
              <Route path="/recruiter" element={<RecruiterDashboard />} />
              <Route path="/recruiter/jobs" element={<RecruiterJobs />} />
              <Route path="/recruiter/jobs/new" element={<JobForm />} />
              <Route path="/recruiter/jobs/:id/edit" element={<JobForm />} />
              <Route
                path="/recruiter/jobs/:jobId/applicants"
                element={<ApplicantsPage />}
              />
              <Route
                path="/recruiter/intelligence"
                element={<RecruiterIntelligence />}
              />
              <Route
                path="/recruiter/jobs/:jobId/intelligence"
                element={<RecruiterIntelligence />}
              />
              <Route
                path="/recruiter/jobs/:jobId/compare"
                element={<CandidateComparison />}
              />
              <Route path="/recruiter/analytics" element={<AnalyticsDashboard />} />
            </Route>

            <Route element={<ProtectedRoute roles={["admin"]} />}>
              <Route path="/admin/moderation" element={<ModerationQueue />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </PageErrorBoundary>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </ThemeProvider>
  );
}
