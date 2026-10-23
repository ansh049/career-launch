import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Sparkles,
  UploadCloud,
  FileCheck,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  Save,
  Briefcase,
  GraduationCap,
  User,
  Mail,
  Phone,
  MapPin,
  Globe,
  Link as LinkIcon,
  ExternalLink,
  ArrowRight,
  RefreshCw,
  FileText,
  BadgeCheck,
  Cpu
} from "lucide-react";
import api from "../services/api";
import { fetchCurrentUser } from "../features/auth/authSlice";

const MAX_RESUME_SIZE = 5 * 1024 * 1024;

export default function ProfilePage() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  // Form State
  const [name, setName] = useState("");
  const [headline, setHeadline] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [bio, setBio] = useState("");
  const [links, setLinks] = useState({ linkedin: "", github: "", portfolio: "" });
  const [skills, setSkills] = useState([]);
  const [education, setEducation] = useState([]);
  const [resumeStorageKey, setResumeStorageKey] = useState("");

  // Input states
  const [newSkillInput, setNewSkillInput] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);

  // UI state
  const [loading, setLoading] = useState(true);
  const [parsing, setParsing] = useState(false);
  const [parseStep, setParseStep] = useState("");
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ type: "", text: "" });
  const [hasExtractedData, setHasExtractedData] = useState(false);

  // Load existing profile from MongoDB
  useEffect(() => {
    let active = true;

    async function loadProfile() {
      try {
        setLoading(true);
        const { data } = await api.get("/api/profile/me");
        if (!active) return;

        const profile = data.profile || {};
        setName(profile.name || user?.name || "");
        setEmail(profile.email || user?.email || "");
        setHeadline(profile.headline || "");
        setPhone(profile.phone || "");
        setLocation(profile.location || "");
        setBio(profile.bio || "");
        setLinks({
          linkedin: profile.links?.linkedin || "",
          github: profile.links?.github || "",
          portfolio: profile.links?.portfolio || "",
        });
        setSkills(profile.skills || []);
        setEducation(profile.education || []);
        setResumeStorageKey(profile.resumeUrl || "");
      } catch (err) {
        if (!active) return;
        // Fallback to user state from auth slice
        if (user) {
          setName(user.name || "");
          setEmail(user.email || "");
          setHeadline(user.headline || "");
          setPhone(user.phone || "");
          setSkills(user.skills || []);
          setEducation(user.education || []);
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadProfile();

    return () => {
      active = false;
    };
  }, [user]);

  // Handle file selection
  function handleFileSelect(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".pdf")) {
      setStatusMessage({ type: "error", text: "Please upload a PDF file (.pdf)" });
      return;
    }
    if (file.size > MAX_RESUME_SIZE) {
      setStatusMessage({ type: "error", text: "Resume must be 5 MB or smaller" });
      return;
    }

    setSelectedFile(file);
    setStatusMessage({ type: "", text: "" });
  }

  // Handle dropzone
  function handleDrop(e) {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".pdf")) {
      setStatusMessage({ type: "error", text: "Please upload a PDF file (.pdf)" });
      return;
    }
    if (file.size > MAX_RESUME_SIZE) {
      setStatusMessage({ type: "error", text: "Resume must be 5 MB or smaller" });
      return;
    }

    setSelectedFile(file);
    setStatusMessage({ type: "", text: "" });
  }

  // Trigger FastAPI Resume Parser
  async function handleParseResume() {
    if (!selectedFile) {
      setStatusMessage({ type: "error", text: "Please select a PDF resume file first." });
      return;
    }

    try {
      setParsing(true);
      setParseStep("Extracting text with pypdf & parsing with AI service...");
      setStatusMessage({ type: "", text: "" });

      const formData = new FormData();
      formData.append("resume", selectedFile);

      const response = await api.post("/api/profile/parse-resume", formData);
      const parsed = response.data?.parsed;

      if (!parsed) {
        throw new Error("Invalid response from resume parsing service.");
      }

      // Populate extracted contact info if empty
      if (parsed.contact_info) {
        if (parsed.contact_info.name && !name) setName(parsed.contact_info.name);
        if (parsed.contact_info.phone && !phone) setPhone(parsed.contact_info.phone);
        if (parsed.contact_info.location && !location) setLocation(parsed.contact_info.location);
        if (parsed.contact_info.links) {
          setLinks((prev) => ({
            linkedin: prev.linkedin || parsed.contact_info.links.linkedin || "",
            github: prev.github || parsed.contact_info.links.github || "",
            portfolio: prev.portfolio || parsed.contact_info.links.portfolio || "",
          }));
        }
      }

      // Populate extracted summary & headline
      if (parsed.headline && !headline) {
        setHeadline(parsed.headline);
      }
      if (parsed.summary && !bio) {
        setBio(parsed.summary);
      }

      // Populate extracted skills (merge unique)
      if (Array.isArray(parsed.skills) && parsed.skills.length > 0) {
        setSkills((prev) => {
          const set = new Set([...prev, ...parsed.skills]);
          return Array.from(set);
        });
      }

      // Populate extracted education
      if (Array.isArray(parsed.education) && parsed.education.length > 0) {
        setEducation((prev) => {
          // If existing is empty, use parsed
          if (!prev.length) return parsed.education;
          // Otherwise merge unique by degree + institution
          const combined = [...prev];
          for (const item of parsed.education) {
            if (!combined.some((c) => c.degree === item.degree && c.institution === item.institution)) {
              combined.push(item);
            }
          }
          return combined;
        });
      }

      if (parsed.resumeStorageKey) {
        setResumeStorageKey(parsed.resumeStorageKey);
      }

      setHasExtractedData(true);
      setStatusMessage({
        type: "success",
        text: `Extracted ${parsed.skills?.length || 0} skills, education & contact details! Review and edit below, then save your profile.`,
      });
    } catch (err) {
      setStatusMessage({
        type: "error",
        text: err.response?.data?.message || err.message || "Failed to parse resume.",
      });
    } finally {
      setParsing(false);
      setParseStep("");
    }
  }

  // Add a new skill
  function handleAddSkill(e) {
    e.preventDefault();
    const trimmed = newSkillInput.trim().toLowerCase();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills([...skills, trimmed]);
      setNewSkillInput("");
    }
  }

  // Remove a skill
  function handleRemoveSkill(skillToRemove) {
    setSkills(skills.filter((s) => s !== skillToRemove));
  }

  // Add education row
  function handleAddEducation() {
    setEducation([
      ...education,
      { degree: "", institution: "", fieldOfStudy: "", graduationYear: "", score: "" },
    ]);
  }

  // Update education row
  function handleUpdateEducation(index, field, value) {
    const updated = [...education];
    updated[index] = { ...updated[index], [field]: value };
    setEducation(updated);
  }

  // Remove education row
  function handleRemoveEducation(index) {
    setEducation(education.filter((_, i) => i !== index));
  }

  // Calculate profile completeness score
  const completionPercentage = Math.min(
    100,
    (name ? 15 : 0) +
      (headline ? 20 : 0) +
      (phone || location ? 15 : 0) +
      (skills.length > 0 ? 25 : 0) +
      (education.length > 0 ? 15 : 0) +
      (bio ? 10 : 0)
  );

  // Save full profile to MongoDB
  async function handleSaveProfile(e) {
    e?.preventDefault();

    try {
      setSaving(true);
      setStatusMessage({ type: "", text: "" });

      const payload = {
        name,
        headline,
        phone,
        location,
        bio,
        links,
        skills,
        education,
        resumeStorageKey,
      };

      const response = await api.put("/api/profile/me", payload);
      dispatch(fetchCurrentUser());

      setStatusMessage({
        type: "success",
        text: "Candidate profile intelligence saved to MongoDB successfully!",
      });
    } catch (err) {
      setStatusMessage({
        type: "error",
        text: err.response?.data?.message || "Failed to update profile.",
      });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 dark:bg-[#090D16] px-4 py-16 text-slate-900 dark:text-white sm:px-6 md:px-12 transition-colors duration-200">
        <div className="mx-auto flex max-w-4xl items-center justify-center gap-3 text-slate-500 dark:text-slate-400">
          <RefreshCw className="h-5 w-5 animate-spin text-blue-600 dark:text-cyan-400" />
          <span>Loading candidate profile...</span>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-[#090D16] px-4 py-10 text-slate-900 dark:text-white sm:px-6 md:px-12 lg:px-16 transition-colors duration-200">
      <div className="mx-auto max-w-5xl">
        {/* Top Header */}
        <div className="border-b border-slate-200 dark:border-slate-800/80 pb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-200/80 bg-blue-50 px-3.5 py-1 text-xs font-semibold text-blue-700 dark:border-cyan-500/30 dark:bg-cyan-500/10 dark:text-cyan-400 mb-2">
                <Cpu className="h-3.5 w-3.5" />
                <span>AI Profile Intelligence</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                Candidate Profile & AI Parser
              </h1>
              <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-400">
                Upload your PDF resume to automatically extract contact info, skills, and education using AI.
              </p>
            </div>

            {/* Profile Completion Card */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 min-w-[200px] shadow-xs dark:border-slate-800/80 dark:bg-slate-900/60">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Profile Score</span>
                <span className="font-extrabold text-blue-600 dark:text-cyan-400">{completionPercentage}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-cyan-500 dark:to-indigo-500 transition-all duration-500"
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 block">
                {completionPercentage === 100 ? "Ready for AI matching" : "Complete skills & education for top matches"}
              </span>
            </div>
          </div>
        </div>

        {/* Status Alerts */}
        {statusMessage.text && (
          <div
            role="alert"
            className={`mt-6 flex items-start gap-3 rounded-2xl border p-4 text-sm ${
              statusMessage.type === "error"
                ? "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300"
                : "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300"
            }`}
          >
            {statusMessage.type === "error" ? (
              <AlertCircle className="h-5 w-5 shrink-0 text-rose-500 dark:text-rose-400 mt-0.5" />
            ) : (
              <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
            )}
            <div className="flex-1">
              <p>{statusMessage.text}</p>
              {statusMessage.type === "success" && (
                <div className="mt-2 flex items-center gap-3">
                  <Link
                    to="/recommendations"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:underline dark:text-cyan-400"
                  >
                    <span>View AI Job Recommendations</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                  <span className="text-slate-400 dark:text-slate-600">•</span>
                  <Link
                    to="/dashboard"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:underline dark:text-slate-300"
                  >
                    <span>Back to Dashboard</span>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 1: AI Resume PDF Upload Card */}
        <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs backdrop-blur-xl dark:border-slate-800/90 dark:bg-gradient-to-b dark:from-slate-900/80 dark:to-slate-950/90">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-cyan-500/20 dark:text-cyan-400">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Upload Resume for AI Extraction</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">FastAPI + pypdf extracts contact information, skills, and education</p>
            </div>
          </div>

          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            className="mt-3 relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-8 text-center transition-all hover:border-blue-400 dark:border-slate-700/80 dark:bg-slate-950/40 dark:hover:border-cyan-500/50"
          >
            <input
              type="file"
              id="resume-file-input"
              accept=".pdf,application/pdf"
              onChange={handleFileSelect}
              className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
              aria-label="Upload PDF resume"
            />
            <UploadCloud className="h-10 w-10 text-blue-600 dark:text-cyan-400 mb-3 animate-pulse" />
            <p className="text-sm font-semibold text-slate-900 dark:text-white">
              {selectedFile ? selectedFile.name : "Drag & drop your PDF resume, or browse files"}
            </p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {selectedFile
                ? `${(selectedFile.size / 1024).toFixed(1)} KB selected`
                : "PDF format up to 5 MB supported"}
            </p>
          </div>

          {selectedFile && (
            <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3 rounded-2xl border border-blue-200 bg-blue-50 p-4 dark:border-cyan-500/20 dark:bg-cyan-500/5">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-blue-600 dark:text-cyan-400" />
                <div>
                  <span className="text-sm font-semibold text-slate-900 dark:text-white">{selectedFile.name}</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 block">Ready for extraction</span>
                </div>
              </div>
              <button
                type="button"
                onClick={handleParseResume}
                disabled={parsing}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm shadow-blue-500/20 hover:from-blue-500 hover:to-indigo-500 transition-all disabled:opacity-50 dark:from-cyan-400 dark:to-blue-500 dark:text-slate-950 dark:shadow-cyan-500/20"
              >
                {parsing ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    <span>{parseStep || "Parsing..."}</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>Parse Resume with AI</span>
                  </>
                )}
              </button>
            </div>
          )}
        </section>

        {/* Step 2: Review, Edit & Save Candidate Intelligence */}
        <form onSubmit={handleSaveProfile} className="mt-8 space-y-8">
          {hasExtractedData && (
            <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 flex items-center gap-3 text-blue-800 text-xs font-medium dark:border-cyan-500/30 dark:bg-cyan-500/10 dark:text-cyan-300">
              <Sparkles className="h-4 w-4 shrink-0 text-blue-600 dark:text-cyan-400" />
              <span>
                Resume parsed! Please review the extracted data below, make any edits or additions, and click <strong>Save to Profile</strong>.
              </span>
            </div>
          )}

          {/* Section: Contact & Personal Info */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs backdrop-blur-xl dark:border-slate-800/90 dark:bg-slate-900/60">
            <div className="flex items-center gap-2.5 mb-6 border-b border-slate-100 dark:border-slate-800/80 pb-4">
              <User className="h-5 w-5 text-blue-600 dark:text-cyan-400" />
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Contact & Professional Details</h2>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="e.g. Jane Doe"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-950/70 dark:text-white dark:placeholder-slate-500 dark:focus:border-cyan-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    disabled
                    className="w-full rounded-xl border border-slate-200 bg-slate-100 py-2.5 pl-10 pr-3 text-sm text-slate-500 cursor-not-allowed dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. +1 (555) 019-2834"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-950/70 dark:text-white dark:placeholder-slate-500 dark:focus:border-cyan-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Location
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. San Francisco, CA or Bangalore, India"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-950/70 dark:text-white dark:placeholder-slate-500 dark:focus:border-cyan-400"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Professional Headline / Title
                </label>
                <input
                  type="text"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  placeholder="e.g. Full Stack Developer | React, Node.js, Python"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-950/70 dark:text-white dark:placeholder-slate-500 dark:focus:border-cyan-400"
                />
              </div>

              {/* Social Links */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  LinkedIn URL
                </label>
                <div className="relative">
                  <LinkIcon className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="url"
                    value={links.linkedin}
                    onChange={(e) => setLinks({ ...links, linkedin: e.target.value })}
                    placeholder="https://linkedin.com/in/username"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-950/70 dark:text-white dark:placeholder-slate-500 dark:focus:border-cyan-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  GitHub URL
                </label>
                <div className="relative">
                  <Globe className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="url"
                    value={links.github}
                    onChange={(e) => setLinks({ ...links, github: e.target.value })}
                    placeholder="https://github.com/username"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-950/70 dark:text-white dark:placeholder-slate-500 dark:focus:border-cyan-400"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section: Skills Intelligence */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs backdrop-blur-xl dark:border-slate-800/90 dark:bg-slate-900/60">
            <div className="flex items-center justify-between gap-3 mb-6 border-b border-slate-100 dark:border-slate-800/80 pb-4">
              <div className="flex items-center gap-2.5">
                <Sparkles className="h-5 w-5 text-blue-600 dark:text-cyan-400" />
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Extracted Skills Intelligence</h2>
              </div>
              <span className="rounded-full bg-blue-50 border border-blue-200 px-2.5 py-1 text-xs font-bold text-blue-700 dark:border-transparent dark:bg-cyan-500/10 dark:text-cyan-400">
                {skills.length} skills identified
              </span>
            </div>

            {/* Add skill input */}
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={newSkillInput}
                onChange={(e) => setNewSkillInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddSkill(e)}
                placeholder="Type a skill and press Add (e.g. Docker, GraphQL, PyTorch)..."
                className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-950/70 dark:text-white dark:placeholder-slate-500 dark:focus:border-cyan-400"
              />
              <button
                type="button"
                onClick={handleAddSkill}
                className="inline-flex items-center gap-1.5 rounded-xl border border-blue-200 bg-blue-50 px-4 py-2.5 text-xs font-bold text-blue-700 hover:bg-blue-100 transition-all shrink-0 dark:border-cyan-500/30 dark:bg-cyan-500/10 dark:text-cyan-400 dark:hover:bg-cyan-500/20"
              >
                <Plus className="h-4 w-4" />
                <span>Add Skill</span>
              </button>
            </div>

            {/* Skill tags */}
            <div className="flex flex-wrap gap-2 pt-2">
              {skills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 transition-all hover:border-blue-300 dark:border-cyan-500/30 dark:bg-cyan-500/10 dark:text-cyan-300 dark:hover:border-cyan-400"
                >
                  <span className="capitalize">{skill}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(skill)}
                    className="text-slate-400 hover:text-rose-500 transition-colors"
                    aria-label={`Remove skill ${skill}`}
                  >
                    ×
                  </button>
                </span>
              ))}
              {!skills.length && (
                <p className="text-xs text-slate-400 italic">
                  No skills listed yet. Upload a resume or add skills manually above.
                </p>
              )}
            </div>
          </div>

          {/* Section: Education Details */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs backdrop-blur-xl dark:border-slate-800/90 dark:bg-slate-900/60">
            <div className="flex items-center justify-between gap-3 mb-6 border-b border-slate-100 dark:border-slate-800/80 pb-4">
              <div className="flex items-center gap-2.5">
                <GraduationCap className="h-5 w-5 text-blue-600 dark:text-cyan-400" />
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Education Details</h2>
              </div>
              <button
                type="button"
                onClick={handleAddEducation}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-all dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Education</span>
              </button>
            </div>

            <div className="space-y-4">
              {education.map((edu, index) => (
                <div
                  key={index}
                  className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5 transition-all hover:border-slate-300 dark:border-slate-800 dark:bg-slate-950/60 dark:hover:border-slate-700"
                >
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <span className="text-xs font-bold text-blue-600 dark:text-cyan-400">
                      Education Entry #{index + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveEducation(index)}
                      className="text-slate-400 hover:text-rose-500 p-1 transition-colors"
                      title="Remove entry"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                        Degree / Certificate
                      </label>
                      <input
                        type="text"
                        value={edu.degree || ""}
                        onChange={(e) => handleUpdateEducation(index, "degree", e.target.value)}
                        placeholder="e.g. Bachelor of Technology (B.Tech)"
                        className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900/90 dark:text-white dark:placeholder-slate-500 dark:focus:border-cyan-400"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                        Institution / University
                      </label>
                      <input
                        type="text"
                        value={edu.institution || ""}
                        onChange={(e) => handleUpdateEducation(index, "institution", e.target.value)}
                        placeholder="e.g. Stanford University"
                        className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900/90 dark:text-white dark:placeholder-slate-500 dark:focus:border-cyan-400"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                        Field of Study / Major
                      </label>
                      <input
                        type="text"
                        value={edu.fieldOfStudy || edu.field_of_study || ""}
                        onChange={(e) => handleUpdateEducation(index, "fieldOfStudy", e.target.value)}
                        placeholder="e.g. Computer Science and Engineering"
                        className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900/90 dark:text-white dark:placeholder-slate-500 dark:focus:border-cyan-400"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                          Graduation Year
                        </label>
                        <input
                          type="text"
                          value={edu.graduationYear || edu.graduation_year || ""}
                          onChange={(e) => handleUpdateEducation(index, "graduationYear", e.target.value)}
                          placeholder="e.g. 2020 - 2024"
                          className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900/90 dark:text-white dark:placeholder-slate-500 dark:focus:border-cyan-400"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                          GPA / Score
                        </label>
                        <input
                          type="text"
                          value={edu.score || ""}
                          onChange={(e) => handleUpdateEducation(index, "score", e.target.value)}
                          placeholder="e.g. 3.9/4.0 or 85%"
                          className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900/90 dark:text-white dark:placeholder-slate-500 dark:focus:border-cyan-400"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {!education.length && (
                <div className="text-center py-6 border border-dashed border-slate-200 rounded-2xl dark:border-slate-800">
                  <p className="text-xs text-slate-400">
                    No education entries yet. Upload your resume or click "+ Add Education" above.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Section: Professional Summary */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs backdrop-blur-xl dark:border-slate-800/90 dark:bg-slate-900/60">
            <div className="flex items-center gap-2.5 mb-4 border-b border-slate-100 dark:border-slate-800/80 pb-4">
              <FileText className="h-5 w-5 text-blue-600 dark:text-cyan-400" />
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Professional Summary</h2>
            </div>
            <textarea
              rows={4}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Highlight your background, core technical strengths, and career aspirations..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none leading-relaxed dark:border-slate-700 dark:bg-slate-950/70 dark:text-white dark:placeholder-slate-500 dark:focus:border-cyan-400"
            />
          </div>

          {/* Save Action */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200 dark:border-slate-800/80">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Saving updates your candidate profile in MongoDB and refreshes your AI Job Matches.
            </p>
            <button
              type="submit"
              disabled={saving}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-600 px-8 py-3.5 text-sm font-extrabold text-white shadow-md shadow-blue-500/20 hover:from-blue-500 hover:to-indigo-500 transition-all hover:scale-[1.02] disabled:opacity-50 dark:from-cyan-400 dark:via-sky-400 dark:to-blue-500 dark:text-slate-950 dark:shadow-cyan-500/25"
            >
              {saving ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Saving to MongoDB...</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>Save to Profile</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
