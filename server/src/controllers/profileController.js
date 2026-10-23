import User from "../models/User.js";
import { storeResume } from "../services/resume-storage.service.js";
import { getResumeAnalysis } from "../services/ai.service.js";

function publicCandidateProfile(user) {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    headline: user.headline || "",
    phone: user.phone || "",
    location: user.location || "",
    bio: user.bio || "",
    links: user.links || { linkedin: "", github: "", portfolio: "" },
    skills: user.skills || [],
    education: user.education || [],
    experience: user.experience || [],
    resumeUrl: user.resumeUrl || "",
    profileCompleted: Boolean(user.profileCompleted),
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

// GET /api/profile/me
export async function getProfile(req, res, next) {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Candidate not found",
      });
    }

    return res.status(200).json({
      success: true,
      profile: publicCandidateProfile(user),
    });
  } catch (error) {
    next(error);
  }
}

// POST /api/profile/parse-resume
export async function parseResumeUpload(req, res, next) {
  let storedResumeId = null;

  try {
    if (!req.file?.buffer) {
      return res.status(400).json({
        success: false,
        message: "A PDF resume is required.",
      });
    }

    // Call Python AI Service for parsing
    const analysis = await getResumeAnalysis(req.file.buffer);

    if (!analysis || typeof analysis.text !== "string" || !Array.isArray(analysis.skills)) {
      return res.status(502).json({
        success: false,
        message: "AI service returned an unexpected response format.",
      });
    }

    // Store resume in private storage for candidate persistence
    try {
      storedResumeId = await storeResume(req.file.buffer);
    } catch (storageErr) {
      console.warn("Resume storage fallback:", storageErr.message);
    }

    // Save resumeText to the user model so recommendation matching works right away
    await User.findByIdAndUpdate(req.user._id, {
      $set: {
        resumeText: analysis.text,
        ...(storedResumeId ? { resumeUrl: storedResumeId } : {}),
      },
    });

    return res.status(200).json({
      success: true,
      message: "Resume parsed successfully.",
      data: {
        text: analysis.text,
        skills: analysis.skills || [],
        skillCount: analysis.skill_count || (analysis.skills?.length || 0),
        contactInfo: analysis.contact_info || {},
        education: analysis.education || [],
        summary: analysis.summary || "",
        headline: analysis.headline || "",
        categorizedSkills: analysis.categorized_skills || {},
        resumeStorageKey: storedResumeId,
      },
    });
  } catch (error) {
    next(error);
  }
}

// PUT /api/profile/me
export async function updateProfile(req, res, next) {
  try {
    const {
      name,
      headline,
      phone,
      location,
      bio,
      links,
      skills,
      education,
      experience,
      resumeStorageKey,
    } = req.body;

    const updateFields = {};

    if (typeof name === "string" && name.trim().length >= 2) {
      updateFields.name = name.trim().slice(0, 80);
    }
    if (typeof headline === "string") {
      updateFields.headline = headline.trim().slice(0, 160);
    }
    if (typeof phone === "string") {
      updateFields.phone = phone.trim().slice(0, 40);
    }
    if (typeof location === "string") {
      updateFields.location = location.trim().slice(0, 120);
    }
    if (typeof bio === "string") {
      updateFields.bio = bio.trim().slice(0, 2000);
    }
    if (links && typeof links === "object") {
      updateFields.links = {
        linkedin: typeof links.linkedin === "string" ? links.linkedin.trim() : "",
        github: typeof links.github === "string" ? links.github.trim() : "",
        portfolio: typeof links.portfolio === "string" ? links.portfolio.trim() : "",
      };
    }
    if (Array.isArray(skills)) {
      updateFields.skills = Array.from(
        new Set(
          skills
            .filter((s) => typeof s === "string" && s.trim())
            .map((s) => s.trim().toLowerCase())
        )
      ).slice(0, 60);
    }
    if (Array.isArray(education)) {
      updateFields.education = education.map((edu) => ({
        degree: typeof edu.degree === "string" ? edu.degree.trim() : "",
        institution: typeof edu.institution === "string" ? edu.institution.trim() : "",
        fieldOfStudy: typeof edu.fieldOfStudy === "string" ? edu.fieldOfStudy.trim() : (typeof edu.field_of_study === "string" ? edu.field_of_study.trim() : ""),
        graduationYear: typeof edu.graduationYear === "string" ? edu.graduationYear.trim() : (typeof edu.graduation_year === "string" ? edu.graduation_year.trim() : ""),
        score: typeof edu.score === "string" ? edu.score.trim() : "",
      }));
    }
    if (Array.isArray(experience)) {
      updateFields.experience = experience.map((exp) => ({
        title: typeof exp.title === "string" ? exp.title.trim() : "",
        company: typeof exp.company === "string" ? exp.company.trim() : "",
        startDate: typeof exp.startDate === "string" ? exp.startDate.trim() : "",
        endDate: typeof exp.endDate === "string" ? exp.endDate.trim() : "",
        description: typeof exp.description === "string" ? exp.description.trim() : "",
      }));
    }
    if (resumeStorageKey && typeof resumeStorageKey === "string") {
      updateFields.resumeUrl = resumeStorageKey;
    }

    updateFields.profileCompleted = true;

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updateFields },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "Candidate account not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Candidate profile saved successfully.",
      profile: publicCandidateProfile(updatedUser),
    });
  } catch (error) {
    next(error);
  }
}
