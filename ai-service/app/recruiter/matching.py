"""
Recruiter-side candidate matching using skill overlap scoring.
Returns evidence-backed scores without making automated hire/reject decisions.
"""

from pydantic import BaseModel, Field


class CandidateProfile(BaseModel):
    candidate_id: str
    name: str = ""
    skills: list[str] = []
    headline: str = ""
    experience_years: int | None = None


class JobRequirements(BaseModel):
    job_id: str
    title: str = ""
    company: str = ""
    skills: list[str] = []
    experience_level: str = ""
    description: str = ""


class CandidateMatchResult(BaseModel):
    candidate_id: str
    match_score: float = Field(ge=0, le=100)
    matched_skills: list[str] = []
    missing_skills: list[str] = []
    strength_summary: str = ""


class RecruiterMatchRequest(BaseModel):
    job: JobRequirements
    candidates: list[CandidateProfile] = Field(max_length=100)


class RecruiterMatchResponse(BaseModel):
    matches: list[CandidateMatchResult] = []
    disclaimer: str = "Scores are informational; do not use as the sole basis for hiring decisions."


def match_candidates_to_job(request: RecruiterMatchRequest) -> RecruiterMatchResponse:
    """Rank candidates against a job based on skill overlap."""
    job_skills = set(s.lower().strip() for s in request.job.skills if s.strip())
    results: list[CandidateMatchResult] = []

    for candidate in request.candidates:
        candidate_skills = set(s.lower().strip() for s in candidate.skills if s.strip())
        matched = sorted(candidate_skills & job_skills)
        missing = sorted(job_skills - candidate_skills)

        score = (len(matched) / max(len(job_skills), 1)) * 100 if job_skills else 50

        summary_parts = []
        if matched:
            summary_parts.append(f"Matches {len(matched)} of {len(job_skills)} required skills: {', '.join(matched[:5])}")
        if missing:
            summary_parts.append(f"Missing: {', '.join(missing[:5])}")
        if candidate.headline:
            summary_parts.append(f"Profile: {candidate.headline[:100]}")

        results.append(CandidateMatchResult(
            candidate_id=candidate.candidate_id,
            match_score=round(score, 1),
            matched_skills=matched,
            missing_skills=missing,
            strength_summary=". ".join(summary_parts) if summary_parts else "No skill data available.",
        ))

    results.sort(key=lambda r: r.match_score, reverse=True)
    return RecruiterMatchResponse(matches=results)
