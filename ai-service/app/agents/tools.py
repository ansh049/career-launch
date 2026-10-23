from typing import Dict, Any, List
from app.matching import match_jobs
from app.career.skill_gap import analyze_skill_gaps
from app.career.roadmap import generate_career_roadmap
from app.career.schemas import RoadmapGenerateRequest
from app.resume_copilot import analyze_and_tailor_resume
from app.resume_copilot_schemas import ResumeCopilotAnalyzeRequest

# Explicit Tool Allow-List
ALLOWED_TOOLS = {
    "search_and_rank_jobs",
    "analyze_skill_gaps",
    "generate_career_roadmap",
    "tailor_resume",
    "prepare_application_draft",
}

def execute_search_jobs(state: Dict[str, Any]) -> Dict[str, Any]:
    resume_text = state.get("candidate_profile", {}).get("resumeText", "") or "Software Developer"
    jobs = state.get("available_jobs", [])
    candidate_skills = state.get("candidate_skills", [])

    results = match_jobs(resume_text, jobs, candidate_skills)
    top_picks = results[:5] if results else []

    target_job = top_picks[0] if top_picks else None
    return {
        "recommended_jobs": top_picks,
        "target_job": target_job,
        "target_role": target_job.get("title", "Software Engineer") if target_job else "Software Engineer",
    }

def execute_skill_gap_analysis(state: Dict[str, Any]) -> Dict[str, Any]:
    candidate_skills = state.get("candidate_skills", [])
    target_job = state.get("target_job") or {}
    target_role = state.get("target_role", "Software Engineer")
    target_skills = target_job.get("required_skills") or target_job.get("skills", [])

    analysis = analyze_skill_gaps(
        candidate_skills=candidate_skills,
        target_role=target_role,
        target_skills=target_skills,
        job_description=target_job.get("description", "")
    )
    return {"skill_gaps": analysis.model_dump()}

def execute_generate_roadmap(state: Dict[str, Any]) -> Dict[str, Any]:
    candidate_skills = state.get("candidate_skills", [])
    target_job = state.get("target_job") or {}
    target_role = state.get("target_role", "Software Engineer")
    target_skills = target_job.get("required_skills") or target_job.get("skills", [])

    roadmap = generate_career_roadmap(
        RoadmapGenerateRequest(
            candidate_skills=candidate_skills,
            target_role=target_role,
            target_job_id=target_job.get("job_id"),
            target_skills=target_skills,
            current_level="Junior"
        )
    )
    return {"roadmap_plan": roadmap.model_dump()}

def execute_tailor_resume(state: Dict[str, Any]) -> Dict[str, Any]:
    resume_text = state.get("candidate_profile", {}).get("resumeText", "") or "Software Developer"
    target_job = state.get("target_job") or {}
    target_role = state.get("target_role", "Software Engineer")

    tailored = analyze_and_tailor_resume(
        ResumeCopilotAnalyzeRequest(
            resume_text=resume_text,
            job_title=target_role,
            job_description=target_job.get("description", ""),
            job_skills=target_job.get("required_skills") or target_job.get("skills", []),
            candidate_skills=state.get("candidate_skills", [])
        )
    )
    return {"tailored_resume": tailored.model_dump()}

def execute_prepare_application_draft(state: Dict[str, Any]) -> Dict[str, Any]:
    target_job = state.get("target_job") or {}
    target_role = state.get("target_role", "Software Engineer")
    company = target_job.get("company", "Company")

    draft_note = (
        f"Dear Hiring Team at {company},\n\n"
        f"I am excited to apply for the {target_role} position. Based on my proven technical background "
        f"and alignment with your tech stack, I am eager to contribute to your engineering objectives.\n\n"
        f"Sincerely,\nCandidate"
    )

    # Consequential Action -> requires explicit human approval
    return {
        "application_draft": {
            "job_id": target_job.get("job_id"),
            "target_role": target_role,
            "company": company,
            "cover_note": draft_note,
        },
        "requires_approval": True,
        "pending_approval": {
            "action_type": "apply_job",
            "title": f"Review & Approve Application Submission to {company}",
            "description": f"The agent has prepared your tailored application package and cover note for '{target_role}' at {company}.",
            "payload": {
                "job_id": target_job.get("job_id"),
                "job_title": target_role,
                "company": company,
                "cover_note": draft_note,
            }
        }
    }
