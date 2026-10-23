import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Briefcase,
  Building2,
  MapPin,
  Calendar,
  DollarSign,
  Sparkles,
  Save,
  Send,
  AlertCircle
} from "lucide-react";
import api from "../services/api";

const emptyForm = {
  title: "",
  company: "",
  description: "",
  responsibilities: "",
  requirements: "",
  skills: "",
  location: "",
  workMode: "onsite",
  employmentType: "internship",
  experienceLevel: "internship",
  salaryMin: "",
  salaryMax: "",
  salaryCurrency: "INR",
  salaryPeriod: "year",
  applicationDeadline: "",
};

function toInputDate(value) {
  if (!value) return "";

  const date = new Date(value);
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);

  return localDate.toISOString().slice(0, 16);
}

function toList(value) {
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

function validateListFields(form) {
  const fields = [
    {
      name: "Skills",
      singular: "skill",
      items: form.skills
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      maxLength: 50,
      required: true,
    },
    {
      name: "Responsibilities",
      singular: "responsibility",
      items: toList(form.responsibilities),
      maxLength: 500,
    },
    {
      name: "Requirements",
      singular: "requirement",
      items: toList(form.requirements),
      maxLength: 500,
    },
  ];

  for (const field of fields) {
    if (field.required && field.items.length === 0) {
      return `Add at least one ${field.singular}.`;
    }
    if (field.items.length > 30) {
      return `${field.name} can contain at most 30 items.`;
    }
    if (field.items.some((item) => item.length > field.maxLength)) {
      return `Each ${field.singular} must be ${field.maxLength} characters or fewer.`;
    }
  }

  return "";
}

function formToPayload(form) {
  return {
    title: form.title.trim(),
    company: form.company.trim(),
    description: form.description.trim(),
    responsibilities: toList(form.responsibilities),
    requirements: toList(form.requirements),
    skills: form.skills
      .split(",")
      .map((skill) => skill.trim())
      .filter(Boolean),
    location: form.location.trim(),
    workMode: form.workMode,
    employmentType: form.employmentType,
    experienceLevel: form.experienceLevel,
    salary: {
      min: form.salaryMin === "" ? null : Number(form.salaryMin),
      max: form.salaryMax === "" ? null : Number(form.salaryMax),
      currency: form.salaryCurrency,
      period: form.salaryPeriod,
    },
    applicationDeadline: form.applicationDeadline
      ? new Date(form.applicationDeadline).toISOString()
      : null,
  };
}

export default function JobForm() {
  const { id } = useParams();
  const editing = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(editing);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!editing) return;

    let active = true;

    api
      .get("/api/jobs/mine?limit=50&page=1")
      .then(({ data }) => {
        const job = data.jobs.find((item) => item._id === id);

        if (!job) {
          throw new Error(
            "Job not found in your listings. It may be on another page.",
          );
        }

        if (active) {
          setForm({
            title: job.title || "",
            company: job.company || "",
            description: job.description || "",
            responsibilities: (job.responsibilities || []).join("\n"),
            requirements: (job.requirements || []).join("\n"),
            skills: (job.skills || []).join(", "),
            location: job.location || "",
            workMode: job.workMode || "onsite",
            employmentType: job.employmentType || "internship",
            experienceLevel: job.experienceLevel || "internship",
            salaryMin: job.salary?.min ?? "",
            salaryMax: job.salary?.max ?? "",
            salaryCurrency: job.salary?.currency || "INR",
            salaryPeriod: job.salary?.period || "year",
            applicationDeadline: toInputDate(job.applicationDeadline),
          });
        }
      })
      .catch((err) => {
        if (active) {
          setError(
            err.response?.data?.message ||
              err.message ||
              "Unable to load this job.",
          );
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [editing, id]);

  function updateField(event) {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    const listError = validateListFields(form);
    if (listError) {
      setError(listError);
      return;
    }

    if (
      form.salaryMin !== "" &&
      form.salaryMax !== "" &&
      Number(form.salaryMin) > Number(form.salaryMax)
    ) {
      setError("Minimum salary cannot exceed maximum salary.");
      return;
    }

    setSubmitting(true);

    try {
      const payload = formToPayload(form);

      if (editing) {
        await api.patch(`/api/jobs/${id}`, payload);
        navigate("/recruiter/jobs");
      } else {
        const { data } = await api.post("/api/jobs", {
          ...payload,
          status: "draft",
        });

        navigate(`/recruiter/jobs/${data.job._id}/edit`, {
          replace: true,
        });
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to save the job. Check your fields and try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function publishNewJob() {
    setError("");

    const listError = validateListFields(form);
    if (listError) {
      setError(listError);
      return;
    }

    if (
      form.salaryMin !== "" &&
      form.salaryMax !== "" &&
      Number(form.salaryMin) > Number(form.salaryMax)
    ) {
      setError("Minimum salary cannot exceed maximum salary.");
      return;
    }

    setSubmitting(true);

    try {
      const payload = formToPayload(form);

      if (editing) {
        await api.patch(`/api/jobs/${id}`, payload);
        await api.patch(`/api/jobs/${id}/status`, {
          status: "published",
        });
      } else {
        await api.post("/api/jobs", {
          ...payload,
          status: "published",
        });
      }

      navigate("/recruiter/jobs");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to publish this job.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#090D16] p-8 text-white flex items-center gap-3">
        <span className="h-5 w-5 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
        <p>Loading job...</p>
      </main>
    );
  }

  const skillCount = form.skills
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean).length;
  const responsibilityCount = toList(form.responsibilities).length;
  const requirementCount = toList(form.requirements).length;

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-[#090D16] px-4 py-8 text-slate-900 dark:text-white sm:px-6 md:px-12 lg:px-16 transition-colors">
      <div className="mx-auto max-w-4xl">
        <Link
          to="/recruiter/jobs"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 dark:text-cyan-400 hover:text-blue-500 dark:hover:text-cyan-300 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>← Back to your jobs</span>
        </Link>

        {/* Heading */}
        <div className="mt-4 border-b border-slate-200 dark:border-slate-800/80 pb-6">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            {editing ? "Edit job listing" : "Create a job listing"}
          </h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Fields marked required must be completed before saving.
          </p>
        </div>

        {error && (
          <div
            role="alert"
            className="mt-6 flex items-center gap-2 rounded-2xl border border-rose-300 dark:border-rose-500/30 bg-rose-50 dark:bg-rose-500/10 p-4 text-sm text-rose-700 dark:text-red-300"
          >
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-500 dark:text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="mt-6 space-y-8 rounded-3xl border border-slate-200 dark:border-slate-800/90 bg-white/95 dark:bg-slate-900/80 p-6 sm:p-10 shadow-xl dark:shadow-2xl backdrop-blur-xl transition-colors"
        >
          {/* Section: Basic Details */}
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-blue-600 dark:text-cyan-400" />
              Role Overview
            </h2>

            <div className="grid gap-5 sm:grid-cols-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Job title *
                <input
                  name="title"
                  value={form.title}
                  onChange={updateField}
                  minLength={3}
                  maxLength={120}
                  required
                  placeholder="e.g. Senior Frontend Engineer"
                  className="mt-2 w-full rounded-xl border border-slate-300 dark:border-slate-700/80 bg-slate-50/70 dark:bg-slate-950/80 p-3 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-blue-500 dark:focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-cyan-400/20"
                />
              </label>

              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Company *
                <input
                  name="company"
                  value={form.company}
                  onChange={updateField}
                  minLength={2}
                  maxLength={120}
                  required
                  placeholder="e.g. Acme Tech Corp"
                  className="mt-2 w-full rounded-xl border border-slate-300 dark:border-slate-700/80 bg-slate-50/70 dark:bg-slate-950/80 p-3 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-blue-500 dark:focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-cyan-400/20"
                />
              </label>

              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Location *
                <input
                  name="location"
                  value={form.location}
                  onChange={updateField}
                  maxLength={150}
                  required
                  placeholder="Remote or San Francisco, CA"
                  className="mt-2 w-full rounded-xl border border-slate-300 dark:border-slate-700/80 bg-slate-50/70 dark:bg-slate-950/80 p-3 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-blue-500 dark:focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-cyan-400/20"
                />
              </label>

              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Work mode *
                <select
                  name="workMode"
                  value={form.workMode}
                  onChange={updateField}
                  className="mt-2 w-full rounded-xl border border-slate-300 dark:border-slate-700/80 bg-slate-50/70 dark:bg-slate-950/80 p-3 text-slate-900 dark:text-white focus:border-blue-500 dark:focus:border-cyan-400 focus:outline-none"
                >
                  <option value="onsite">On-site</option>
                  <option value="remote">Remote</option>
                  <option value="hybrid">Hybrid</option>
                </select>
              </label>

              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Employment type *
                <select
                  name="employmentType"
                  value={form.employmentType}
                  onChange={updateField}
                  className="mt-2 w-full rounded-xl border border-slate-300 dark:border-slate-700/80 bg-slate-50/70 dark:bg-slate-950/80 p-3 text-slate-900 dark:text-white focus:border-blue-500 dark:focus:border-cyan-400 focus:outline-none"
                >
                  <option value="internship">Internship</option>
                  <option value="full-time">Full-time</option>
                  <option value="part-time">Part-time</option>
                  <option value="contract">Contract</option>
                </select>
              </label>

              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Experience level *
                <select
                  name="experienceLevel"
                  value={form.experienceLevel}
                  onChange={updateField}
                  className="mt-2 w-full rounded-xl border border-slate-300 dark:border-slate-700/80 bg-slate-50/70 dark:bg-slate-950/80 p-3 text-slate-900 dark:text-white focus:border-blue-500 dark:focus:border-cyan-400 focus:outline-none"
                >
                  <option value="internship">Internship</option>
                  <option value="entry">Entry-level</option>
                  <option value="junior">Junior</option>
                  <option value="mid">Mid-level</option>
                  <option value="senior">Senior</option>
                </select>
              </label>
            </div>
          </div>

          {/* Section: Description & Skills */}
          <div className="border-t border-slate-200 dark:border-slate-800/80 pt-6 space-y-5">
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
              Description *
              <textarea
                name="description"
                value={form.description}
                onChange={updateField}
                minLength={30}
                maxLength={20000}
                required
                rows={6}
                placeholder="Describe the role, responsibilities, culture, and requirements..."
                className="mt-2 w-full rounded-2xl border border-slate-300 dark:border-slate-700/80 bg-slate-50/70 dark:bg-slate-950/80 p-4 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-blue-500 dark:focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-cyan-400/20"
              />
            </label>

            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
              Skills * (comma-separated)
              <input
                name="skills"
                value={form.skills}
                onChange={updateField}
                required
                placeholder="React, TypeScript, Tailwind CSS, GraphQL"
                className="mt-2 w-full rounded-xl border border-slate-300 dark:border-slate-700/80 bg-slate-50/70 dark:bg-slate-950/80 p-3 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-blue-500 dark:focus:border-cyan-400 focus:outline-none"
              />
              <span className="mt-1 block text-xs text-slate-500">
                {skillCount}/30 skills; up to 50 characters each
              </span>
            </label>

            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
              Responsibilities (one per line)
              <textarea
                name="responsibilities"
                value={form.responsibilities}
                onChange={updateField}
                rows={4}
                placeholder="Design user-facing features&#10;Collaborate with product designers&#10;Write clean unit tests"
                className="mt-2 w-full rounded-2xl border border-slate-300 dark:border-slate-700/80 bg-slate-50/70 dark:bg-slate-950/80 p-4 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-blue-500 dark:focus:border-cyan-400 focus:outline-none"
              />
              <span className="mt-1 block text-xs text-slate-500">
                {responsibilityCount}/30 items; up to 500 characters each
              </span>
            </label>

            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
              Requirements (one per line)
              <textarea
                name="requirements"
                value={form.requirements}
                onChange={updateField}
                rows={4}
                placeholder="2+ years experience with React&#10;Strong understanding of REST and APIs&#10;Bachelor's in CS or equivalent"
                className="mt-2 w-full rounded-2xl border border-slate-300 dark:border-slate-700/80 bg-slate-50/70 dark:bg-slate-950/80 p-4 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-blue-500 dark:focus:border-cyan-400 focus:outline-none"
              />
              <span className="mt-1 block text-xs text-slate-500">
                {requirementCount}/30 items; up to 500 characters each
              </span>
            </label>
          </div>

          {/* Section: Compensation & Deadlines */}
          <section className="border-t border-slate-200 dark:border-slate-800/80 pt-6">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              Salary (optional)
            </h2>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Minimum
                <input
                  type="number"
                  name="salaryMin"
                  value={form.salaryMin}
                  onChange={updateField}
                  min="0"
                  placeholder="e.g. 50000"
                  className="mt-2 w-full rounded-xl border border-slate-300 dark:border-slate-700/80 bg-slate-50/70 dark:bg-slate-950/80 p-3 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-blue-500 dark:focus:border-cyan-400 focus:outline-none"
                />
              </label>

              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Maximum
                <input
                  type="number"
                  name="salaryMax"
                  value={form.salaryMax}
                  onChange={updateField}
                  min="0"
                  placeholder="e.g. 80000"
                  className="mt-2 w-full rounded-xl border border-slate-300 dark:border-slate-700/80 bg-slate-50/70 dark:bg-slate-950/80 p-3 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-blue-500 dark:focus:border-cyan-400 focus:outline-none"
                />
              </label>

              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Currency
                <select
                  name="salaryCurrency"
                  value={form.salaryCurrency}
                  onChange={updateField}
                  className="mt-2 w-full rounded-xl border border-slate-300 dark:border-slate-700/80 bg-slate-50/70 dark:bg-slate-950/80 p-3 text-slate-900 dark:text-white focus:border-blue-500 dark:focus:border-cyan-400 focus:outline-none"
                >
                  <option value="INR">INR</option>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                </select>
              </label>

              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Pay period
                <select
                  name="salaryPeriod"
                  value={form.salaryPeriod}
                  onChange={updateField}
                  className="mt-2 w-full rounded-xl border border-slate-300 dark:border-slate-700/80 bg-slate-50/70 dark:bg-slate-950/80 p-3 text-slate-900 dark:text-white focus:border-blue-500 dark:focus:border-cyan-400 focus:outline-none"
                >
                  <option value="year">Per year</option>
                  <option value="month">Per month</option>
                  <option value="hour">Per hour</option>
                </select>
              </label>
            </div>
          </section>

          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 border-t border-slate-200 dark:border-slate-800/80 pt-6">
            Application deadline (optional)
            <input
              type="datetime-local"
              name="applicationDeadline"
              value={form.applicationDeadline}
              onChange={updateField}
              className="mt-2 w-full rounded-xl border border-slate-300 dark:border-slate-700/80 bg-slate-50/70 dark:bg-slate-950/80 p-3 text-slate-900 dark:text-white focus:border-blue-500 dark:focus:border-cyan-400 focus:outline-none"
            />
          </label>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-4 border-t border-slate-200 dark:border-slate-800/80 pt-6">
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/80 px-6 py-3.5 text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-400 dark:hover:border-slate-600 disabled:opacity-50 transition-all cursor-pointer shadow-sm"
            >
              <Save className="h-4 w-4" />
              <span>
                {submitting
                  ? "Saving..."
                  : editing
                    ? "Save changes"
                    : "Save as draft"}
              </span>
            </button>

            <button
              type="button"
              disabled={submitting}
              onClick={publishNewJob}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-cyan-400 dark:to-blue-500 px-6 py-3.5 text-sm font-bold text-white dark:text-slate-950 shadow-md shadow-blue-500/20 dark:shadow-cyan-400/20 hover:from-blue-500 hover:to-indigo-500 dark:hover:from-cyan-300 dark:hover:to-blue-400 disabled:opacity-50 transition-all cursor-pointer"
            >
              <Send className="h-4 w-4" />
              <span>
                {submitting
                  ? "Processing..."
                  : editing
                    ? "Save and publish"
                    : "Publish job"}
              </span>
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
