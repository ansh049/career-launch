import { afterEach, describe, it, expect, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import authReducer from "./features/auth/authSlice";
import App from "./App";
import ProtectedRoute from "./components/ProtectedRoute";
import JobDetailsPage from "./pages/JobDetailsPage";
import JobsPage from "./pages/JobsPage";
import CandidateDashboard from "./pages/CandidateDashboard";
import RecruiterDashboard from "./pages/RecruiterDashboard";
import ApplicantsPage from "./pages/ApplicantsPage";
import ProfilePage from "./pages/ProfilePage";
import RecommendationsPage from "./pages/RecommendationsPage";
import api from "./services/api";
import PageErrorBoundary from "./components/PageErrorBoundary";

afterEach(() => {
  cleanup();
  window.history.replaceState({}, "", "/");
  vi.restoreAllMocks();
});

function renderWithStore(ui, user = null) {
  const store = configureStore({
    reducer: { auth: authReducer },
    preloadedState: {
      auth: { user, loading: false, initialized: true, error: null },
    },
  });

  return render(<Provider store={store}>{ui}</Provider>);
}

describe("CareerLaunch", () => {
  it("renders the home page", () => {
    const store = configureStore({
      reducer: { auth: authReducer },
      preloadedState: {
        auth: {
          user: null,
          loading: false,
          initialized: true,
          error: null,
        },
      },
    });

    render(
      <Provider store={store}>
        <App />
      </Provider>,
    );

    expect(screen.getByText("CareerLaunch")).toBeTruthy();
  });

  it("shows a visible pending screen for unverified recruiters", () => {
    const store = configureStore({
      reducer: { auth: authReducer },
      preloadedState: {
        auth: {
          user: { role: "recruiter", recruiterVerified: false },
          loading: false,
          initialized: true,
          error: null,
        },
      },
    });

    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={["/recruiter"]}>
          <Routes>
            <Route element={<ProtectedRoute roles={["recruiter"]} />}>
              <Route path="/recruiter" element={<h1>Recruiter dashboard</h1>} />
            </Route>
          </Routes>
        </MemoryRouter>
      </Provider>,
    );

    expect(
      screen.getByRole("heading", { name: "Recruiter verification pending" }),
    ).toBeTruthy();
    expect(screen.getByRole("status")).toBeTruthy();
  });

  it("renders a public job returned in the API job field", async () => {
    const getJob = vi.spyOn(api, "get").mockResolvedValue({
      data: {
        job: {
          _id: "job-1",
          company: "Example Co",
          title: "Frontend Engineer",
          location: "Remote",
          employmentType: "full-time",
          experienceLevel: "junior",
          description:
            "Build and maintain user interfaces for our platform.",
          skills: ["React"],
          },
      },
    });

    renderWithStore(
        <MemoryRouter initialEntries={["/jobs/job-1"]}>
          <Routes>
            <Route path="/jobs/:id" element={<JobDetailsPage />} />
          </Routes>
        </MemoryRouter>,
    );

    expect(
      await screen.findByRole("heading", { name: "Frontend Engineer" }),
    ).toBeTruthy();
    expect(screen.getByText("Remote")).toBeTruthy();
    expect(screen.getByText("full time")).toBeTruthy();
    expect(screen.getByText("junior")).toBeTruthy();
    expect(getJob).toHaveBeenCalledWith("/api/jobs/job-1");
  });

  it("renders jobs from the jobs API response without requiring skills", async () => {
    const getJobs = vi.spyOn(api, "get").mockResolvedValue({
      data: {
        success: true,
        jobs: [
          {
            _id: "job-1",
            company: "Example Co",
            title: "Frontend Engineer",
            location: "Remote",
            employmentType: "full-time",
            description: "Build and maintain user interfaces for our platform.",
          },
        ],
        pagination: { page: 1, limit: 10, total: 1 },
      },
    });

    render(
      <MemoryRouter>
        <JobsPage />
      </MemoryRouter>,
    );

    expect(
      await screen.findByRole("heading", { name: "Frontend Engineer" }),
    ).toBeTruthy();
    expect(screen.getByText("Remote · full-time")).toBeTruthy();
    expect(getJobs).toHaveBeenCalledWith("/api/jobs", {
      params: { q: undefined, employmentType: undefined },
    });
  });

  it("loads candidate dashboard applications from the canonical applications API", async () => {
    const get = vi.spyOn(api, "get").mockResolvedValue({
      data: {
        success: true,
        applications: [
          {
            _id: "application-1",
            status: "reviewing",
            job: { title: "Frontend Engineer", company: "Example Co" },
          },
        ],
      },
    });

    renderWithStore(
      <MemoryRouter>
        <CandidateDashboard />
      </MemoryRouter>,
      { id: "candidate-1", name: "Candidate", role: "candidate" },
    );

    expect(
      await screen.findByRole("heading", { name: "Frontend Engineer" }),
    ).toBeTruthy();
    expect(get).toHaveBeenCalledWith("/api/applications/mine?page=1&limit=50");
    expect(screen.getAllByText("1")).toHaveLength(2);
  });

  it("loads recruiter jobs from the canonical jobs API", async () => {
    const get = vi.spyOn(api, "get").mockResolvedValue({
      data: {
        success: true,
        jobs: [
          {
            _id: "job-1",
            title: "Frontend Engineer",
            company: "Example Co",
            status: "published",
          },
        ],
      },
    });

    renderWithStore(
      <MemoryRouter>
        <RecruiterDashboard />
      </MemoryRouter>,
      { id: "recruiter-1", role: "recruiter", recruiterVerified: true },
    );

    expect(
      await screen.findByRole("heading", { name: "Frontend Engineer" }),
    ).toBeTruthy();
    expect(get).toHaveBeenCalledWith("/api/jobs/mine?limit=50&page=1");
  });

  it("loads and updates applicants using the job and application APIs", async () => {
    const get = vi.spyOn(api, "get").mockResolvedValue({
      data: {
        success: true,
        job: { title: "Frontend Engineer", company: "Example Co" },
        applications: [
          {
            _id: "application-1",
            status: "submitted",
            candidate: { name: "Candidate", email: "candidate@example.test" },
          },
        ],
      },
    });
    const patch = vi.spyOn(api, "patch").mockResolvedValue({
      data: {
        success: true,
        application: {
          _id: "application-1",
          status: "reviewing",
          candidate: { name: "Candidate", email: "candidate@example.test" },
        },
      },
    });

    renderWithStore(
      <MemoryRouter initialEntries={["/recruiter/jobs/job-1/applicants"]}>
        <Routes>
          <Route
            path="/recruiter/jobs/:jobId/applicants"
            element={<ApplicantsPage />}
          />
        </Routes>
      </MemoryRouter>,
      { id: "recruiter-1", role: "recruiter", recruiterVerified: true },
    );

    expect(
      await screen.findByText("candidate@example.test"),
    ).toBeTruthy();
    expect(get).toHaveBeenCalledWith(
      "/api/jobs/job-1/applications?page=1&limit=50",
    );

    fireEvent.change(screen.getByLabelText("Update application status"), {
      target: { value: "reviewing" },
    });
    expect(patch).toHaveBeenCalledWith(
      "/api/applications/application-1/status",
      { status: "reviewing" },
    );
  });

  it("opens My applications for a signed-in candidate", async () => {
    const get = vi.spyOn(api, "get").mockImplementation((url) => {
      if (url === "/api/auth/me") {
        return Promise.resolve({
          data: { user: { id: "candidate-1", name: "Candidate", role: "candidate" } },
        });
      }

      if (url.startsWith("/api/applications/mine")) {
        return Promise.resolve({
          data: {
            applications: [
              {
                _id: "application-1",
                status: "submitted",
                createdAt: "2026-10-20T00:00:00.000Z",
                updatedAt: "2026-10-20T00:00:00.000Z",
                job: {
                  _id: "job-1",
                  title: "Frontend Engineer",
                  company: "Example Co",
                  location: "Remote",
                },
                resume: { originalName: "resume.pdf" },
              },
            ],
          },
        });
      }

      return Promise.reject(new Error(`Unexpected GET ${url}`));
    });
    const store = configureStore({
      reducer: { auth: authReducer },
      preloadedState: {
        auth: {
          user: { id: "candidate-1", role: "candidate" },
          loading: false,
          initialized: true,
          error: null,
        },
      },
    });
    window.history.pushState({}, "", "/applications");

    render(
      <Provider store={store}>
        <App />
      </Provider>,
    );

    expect(
      await screen.findByRole("heading", { name: "My applications" }),
    ).toBeTruthy();
    expect(
      await screen.findByRole("heading", { name: "Frontend Engineer" }),
    ).toBeTruthy();
    expect(get).toHaveBeenCalledWith("/api/applications/mine?page=1&limit=50");
  });

  it("shows a visible error when the applications API response is invalid", async () => {
    vi.spyOn(api, "get").mockImplementation((url) => {
      if (url === "/api/auth/me") {
        return Promise.resolve({
          data: { user: { id: "candidate-1", role: "candidate" } },
        });
      }

      return Promise.resolve({ data: { success: true } });
    });
    const store = configureStore({
      reducer: { auth: authReducer },
      preloadedState: {
        auth: {
          user: { id: "candidate-1", role: "candidate" },
          loading: false,
          initialized: true,
          error: null,
        },
      },
    });
    window.history.pushState({}, "", "/applications");

    render(
      <Provider store={store}>
        <App />
      </Provider>,
    );

    expect(
      await screen.findByRole("heading", { name: "My applications" }),
    ).toBeTruthy();
    const alert = await screen.findByRole("alert");
    expect(alert.textContent).toContain("The applications response was invalid.");
  });

  it("shows an error page instead of a blank screen on a rendering exception", () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    function BrokenPage() {
      throw new Error("render failed");
    }

    render(
      <MemoryRouter>
        <PageErrorBoundary>
          <BrokenPage />
        </PageErrorBoundary>
      </MemoryRouter>,
    );

    expect(
      screen.getByRole("heading", { name: "This page could not be loaded" }),
    ).toBeTruthy();
    expect(consoleError).toHaveBeenCalled();
  });

  it("submits a PDF and cover letter to the job application endpoint", async () => {
    vi.spyOn(api, "get").mockImplementation((url) => {
      if (url === "/api/auth/me") {
        return Promise.resolve({
          data: { user: { id: "candidate-1", role: "candidate" } },
        });
      }

      if (url === "/api/jobs/job-1") {
        return Promise.resolve({
          data: {
            job: {
              _id: "job-1",
              company: "Example Co",
              title: "Frontend Engineer",
              location: "Remote",
              employmentType: "full-time",
              experienceLevel: "junior",
              description: "Build user interfaces.",
              skills: [],
            },
          },
        });
      }

      return Promise.reject(new Error(`Unexpected GET ${url}`));
    });
    const post = vi.spyOn(api, "post").mockResolvedValue({
      data: {
        success: true,
        message: "Application submitted successfully.",
        application: { _id: "application-1", status: "submitted" },
      },
    });

    renderWithStore(
        <MemoryRouter initialEntries={["/jobs/job-1"]}>
          <Routes>
            <Route path="/jobs/:id" element={<JobDetailsPage />} />
          </Routes>
        </MemoryRouter>,
      { id: "candidate-1", role: "candidate" },
    );

    const resume = new File(["%PDF-1.4 test"], "resume.pdf", {
      type: "application/pdf",
    });
    fireEvent.change(await screen.findByLabelText(/Resume \(PDF\)/), {
      target: { files: [resume] },
    });
    fireEvent.change(screen.getByLabelText(/Cover letter \(optional\)/), {
      target: { value: "I am interested in this position." },
    });
    fireEvent.submit(
      screen.getByRole("button", { name: "Submit application" }).closest("form"),
    );

    expect(
      await screen.findByText("Application submitted successfully."),
    ).toBeTruthy();
    expect(post).toHaveBeenCalledWith(
      "/api/jobs/job-1/applications",
      expect.any(FormData),
    );
    const submittedForm = post.mock.calls[0][1];
    expect(submittedForm.get("resume")).toBe(resume);
    expect(submittedForm.get("coverLetter")).toBe(
      "I am interested in this position.",
    );
  });

  it("renders the candidate profile intelligence page with resume upload", async () => {
    vi.spyOn(api, "get").mockImplementation((url) => {
      if (url === "/api/profile/me") {
        return Promise.resolve({
          data: {
            success: true,
            profile: {
              name: "Jane Doe",
              email: "jane@example.com",
              headline: "Full Stack Engineer",
              phone: "+1 555-1234",
              skills: ["python", "react"],
              education: [
                {
                  degree: "Bachelor of Technology",
                  institution: "Stanford University",
                  fieldOfStudy: "Computer Science",
                  graduationYear: "2024",
                },
              ],
            },
          },
        });
      }
      return Promise.reject(new Error(`Unexpected GET ${url}`));
    });

    renderWithStore(
      <MemoryRouter initialEntries={["/profile"]}>
        <Routes>
          <Route path="/profile" element={<ProfilePage />} />
        </Routes>
      </MemoryRouter>,
      { id: "candidate-1", role: "candidate", name: "Jane Doe" }
    );

    expect(
      await screen.findByText("Candidate Profile & AI Parser")
    ).toBeTruthy();
    expect(await screen.findByText("Extracted Skills Intelligence")).toBeTruthy();
    expect(screen.getByDisplayValue("Full Stack Engineer")).toBeTruthy();
    expect(screen.getByText("python")).toBeTruthy();
  });

  it("renders recommendations with match scores and skill-gap analysis", async () => {
    vi.spyOn(api, "get").mockImplementation((url) => {
      if (url === "/api/recommendations/me") {
        return Promise.resolve({
          data: {
            success: true,
            recommendations: [
              {
                job_id: "job-101",
                title: "Senior Full Stack Engineer",
                company: "Acme Innovations",
                location: "San Francisco, CA",
                job_type: "full-time",
                work_mode: "remote",
                experience_level: "senior",
                similarity_score: 88.5,
                matched_skills: ["python", "react", "fastapi"],
                missing_skills: ["docker", "kubernetes"],
                required_skills: ["docker", "fastapi", "kubernetes", "python", "react"],
                match_level: "high",
              },
            ],
          },
        });
      }
      return Promise.reject(new Error(`Unexpected GET ${url}`));
    });

    renderWithStore(
      <MemoryRouter initialEntries={["/recommendations"]}>
        <Routes>
          <Route path="/recommendations" element={<RecommendationsPage />} />
        </Routes>
      </MemoryRouter>,
      { id: "candidate-1", role: "candidate", name: "Jane Doe" }
    );

    expect(
      await screen.findByRole("heading", { name: "Senior Full Stack Engineer" })
    ).toBeTruthy();
    expect(screen.getByText("Acme Innovations")).toBeTruthy();
    expect(screen.getByText("88.5% Match")).toBeTruthy();
    expect(screen.getByText("Matching Skills (3)")).toBeTruthy();
    expect(screen.getByText("Skills to Develop (2)")).toBeTruthy();
    expect(screen.getByText("python")).toBeTruthy();
    expect(screen.getByText("kubernetes")).toBeTruthy();
  });
});

