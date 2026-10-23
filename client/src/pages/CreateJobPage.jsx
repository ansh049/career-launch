import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const initialForm = {
  title: "",
  company: "",
  description: "",
  skills: "",
  location: "Remote",
  jobType: "internship",
  experienceLevel: "fresher"
};

export default function CreateJobPage() {
  const [form, setForm] = useState(initialForm);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  function update(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  async function submit(event) {
    event.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      const payload = {
        ...form,
        skills: form.skills.split(",").map((s) => s.trim()).filter(Boolean)
      };

      const { data } = await api.post("/api/jobs", payload);
      navigate(`/jobs/${data.data._id}`);
    } catch (error) {
      setMessage(error.response?.data?.message || "Could not create job");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 px-6 py-10 text-slate-900 dark:text-white transition-colors">
      <form onSubmit={submit} className="mx-auto max-w-2xl space-y-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-sm dark:shadow-md">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Create a job listing</h1>

        {[
          ["title", "Job title"],
          ["company", "Company"],
          ["location", "Location"]
        ].map(([name, label]) => (
          <label key={name} className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
            <span className="mb-2 block">{label}</span>
            <input name={name} value={form[name]} onChange={update} required
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-950 p-3 text-slate-900 dark:text-white focus:border-blue-500 dark:focus:border-cyan-400 focus:outline-none" />
          </label>
        ))}

        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
          <span className="mb-2 block">Description</span>
          <textarea name="description" value={form.description} onChange={update}
            required minLength={20} maxLength={20000} rows={8}
            className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-950 p-3 text-slate-900 dark:text-white focus:border-blue-500 dark:focus:border-cyan-400 focus:outline-none" />
        </label>

        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
          <span className="mb-2 block">Required skills (comma-separated)</span>
          <input name="skills" value={form.skills} onChange={update}
            placeholder="React, Node.js, MongoDB"
            className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-950 p-3 text-slate-900 dark:text-white focus:border-blue-500 dark:focus:border-cyan-400 focus:outline-none" />
        </label>

        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
          <span className="mb-2 block">Job type</span>
          <select name="jobType" value={form.jobType} onChange={update}
            className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-950 p-3 text-slate-900 dark:text-white focus:border-blue-500 dark:focus:border-cyan-400 focus:outline-none">
            <option value="internship">Internship</option>
            <option value="full-time">Full-time</option>
            <option value="part-time">Part-time</option>
          </select>
        </label>

        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
          <span className="mb-2 block">Experience level</span>
          <select name="experienceLevel" value={form.experienceLevel} onChange={update}
            className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-950 p-3 text-slate-900 dark:text-white focus:border-blue-500 dark:focus:border-cyan-400 focus:outline-none">
            <option value="fresher">Fresher</option>
            <option value="entry">Entry level</option>
            <option value="experienced">Experienced</option>
          </select>
        </label>

        {message && <p role="alert" className="text-sm text-red-500">{message}</p>}

        <button disabled={saving} className="rounded-xl bg-blue-600 dark:bg-cyan-400 px-6 py-3 font-bold text-white dark:text-slate-950 shadow-md hover:bg-blue-500 dark:hover:bg-cyan-300 transition-all cursor-pointer">
          {saving ? "Publishing..." : "Publish job"}
        </button>
      </form>
    </main>
  );
}