from functools import lru_cache
import re

from app.skills import extract_skills

SCORING_VERSION = "v2.0"
SCORING_WEIGHTS = {
    "semantic": 0.50,
    "skill": 0.35,
    "experience": 0.15,
}

@lru_cache(maxsize=1)
def get_model():
    from sentence_transformers import SentenceTransformer
    return SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")


def _calculate_experience_fit(job_exp: str, resume_text: str) -> tuple[float, str]:
    """Calculate deterministic experience fit score (0-100) and status."""
    if not job_exp:
        return 80.0, "Fit"

    exp_lower = job_exp.lower().strip()
    text_lower = resume_text.lower()

    # Detect candidate seniorities in resume
    years_matches = re.findall(r"(\d+)\+?\s*(?:years?|yrs?)(?:\s+of)?\s+experience", text_lower)
    max_years = max([int(y) for y in years_matches], default=1)

    if "intern" in exp_lower or "entry" in exp_lower:
        return 95.0, "Well Aligned"
    elif "mid" in exp_lower:
        if max_years >= 2 or "mid" in text_lower or "developer" in text_lower:
            return 90.0, "Well Aligned"
        return 75.0, "Moderate"
    elif "senior" in exp_lower or "lead" in exp_lower:
        if max_years >= 5 or "senior" in text_lower or "lead" in text_lower:
            return 90.0, "Well Aligned"
        elif max_years >= 3:
            return 70.0, "Developing"
        return 50.0, "Needs More Experience"

    return 80.0, "Fit"


def match_jobs(
    resume_text: str,
    jobs: list[dict],
    candidate_skills: list[str] | None = None
) -> list[dict]:
    if not jobs:
        return []

    from sklearn.metrics.pairwise import cosine_similarity
    model = get_model()

    resume_vector = model.encode([resume_text])
    job_texts = [
        f"{job.get('title', '')}. "
        f"{job.get('company', '')}. "
        f"{job.get('description', '')}. "
        f"Location: {job.get('location', '')}. "
        f"Required skills: {', '.join(job.get('skills', []))}"
        for job in jobs
    ]

    job_vectors = model.encode(job_texts)
    similarities = cosine_similarity(resume_vector, job_vectors)[0]

    # Combine extracted skills from text and any explicit candidate skills
    extracted = set(extract_skills(resume_text))
    explicit = {s.lower().strip() for s in candidate_skills} if candidate_skills else set()
    resume_skills = extracted | explicit

    results = []

    for job, similarity in zip(jobs, similarities):
        required_skills = {
            skill.lower().strip() for skill in job.get("skills", [])
        }

        matched = sorted(resume_skills & required_skills)
        missing = sorted(required_skills - resume_skills)

        raw_sim = float(similarity)
        semantic_score = round(max(0.0, min(1.0, raw_sim)) * 100, 1)

        # Skill coverage calculation
        if required_skills:
            skill_score = round((len(matched) / len(required_skills)) * 100, 1)
        else:
            skill_score = 100.0 if not matched else min(100.0, float(len(matched) * 20.0))

        # Experience fit calculation
        job_exp = str(job.get("experience_level", "") or job.get("experienceLevel", ""))
        experience_score, exp_fit_label = _calculate_experience_fit(job_exp, resume_text)

        # Weighted reproducible composite score
        composite_score = round(
            (semantic_score * SCORING_WEIGHTS["semantic"])
            + (skill_score * SCORING_WEIGHTS["skill"])
            + (experience_score * SCORING_WEIGHTS["experience"]),
            1,
        )

        # For backward compatibility with existing tests and contracts, similarity_score
        # reflects semantic relevance while composite components are fully exposed.
        evidence_matched = [
            {
                "skill": s,
                "found_in": "resume_content" if s in extracted else "candidate_skills"
            }
            for s in matched
        ]

        results.append({
            "job_id": str(job.get("id", "")),
            "title": job.get("title", ""),
            "company": job.get("company", ""),
            "location": job.get("location", ""),
            "job_type": job.get("job_type", "") or job.get("jobType", ""),
            "work_mode": job.get("work_mode", "") or job.get("workMode", ""),
            "experience_level": job_exp,
            "similarity_score": semantic_score,
            "composite_score": composite_score,
            "score_components": {
                "semantic_score": semantic_score,
                "skill_score": skill_score,
                "experience_score": experience_score,
                "scoring_version": SCORING_VERSION,
                "weights": SCORING_WEIGHTS
            },
            "matched_skills": matched,
            "missing_skills": missing,
            "required_skills": sorted(required_skills),
            "match_level": "high" if semantic_score >= 70 else ("medium" if semantic_score >= 45 else "low"),
            "evidence": {
                "matched_skills": evidence_matched,
                "missing_skills": missing,
                "experience_fit": exp_fit_label,
            },
            "scoring_version": SCORING_VERSION,
        })

    return sorted(
        results,
        key=lambda item: item["similarity_score"],
        reverse=True
    )