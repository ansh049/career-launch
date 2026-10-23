from typing import List, Dict, Tuple
from app.career.schemas import SkillGapItem, SkillGapAnalysisResponse

# Standard role skill mappings for fallback and role-based baseline comparisons
ROLE_SKILL_CATALOG: Dict[str, Dict[str, List[str]]] = {
    "frontend": {
        "critical": ["javascript", "typescript", "react", "html", "css"],
        "recommended": ["tailwind css", "next.js", "redux", "jest", "vite"],
    },
    "backend": {
        "critical": ["node.js", "python", "express", "sql", "rest api"],
        "recommended": ["docker", "mongodb", "postgresql", "redis", "fastapi"],
    },
    "full stack": {
        "critical": ["javascript", "react", "node.js", "mongodb", "rest api"],
        "recommended": ["typescript", "docker", "tailwind css", "git", "aws"],
    },
    "ai engineer": {
        "critical": ["python", "pytorch", "transformers", "scikit-learn", "numpy"],
        "recommended": ["fastapi", "docker", "pandas", "langchain", "groq"],
    },
    "data engineer": {
        "critical": ["python", "sql", "postgresql", "spark", "etl"],
        "recommended": ["docker", "airflow", "aws", "kafka", "snowflake"],
    },
    "devops": {
        "critical": ["docker", "kubernetes", "linux", "ci/cd", "aws"],
        "recommended": ["terraform", "github actions", "bash", "prometheus", "python"],
    },
}

SKILL_CATEGORIES: Dict[str, str] = {
    "react": "Frontend", "vue": "Frontend", "angular": "Frontend", "tailwind css": "Frontend", "next.js": "Frontend",
    "html": "Frontend", "css": "Frontend", "javascript": "Core Language", "typescript": "Core Language",
    "python": "Core Language", "java": "Core Language", "golang": "Core Language", "rust": "Core Language",
    "node.js": "Backend", "express": "Backend", "fastapi": "Backend", "django": "Backend", "flask": "Backend",
    "mongodb": "Database", "postgresql": "Database", "mysql": "Database", "redis": "Database", "sql": "Database",
    "docker": "DevOps & Cloud", "kubernetes": "DevOps & Cloud", "aws": "DevOps & Cloud", "ci/cd": "DevOps & Cloud",
    "pytorch": "AI & ML", "tensorflow": "AI & ML", "scikit-learn": "AI & ML", "transformers": "AI & ML"
}

def _get_skill_category(skill: str) -> str:
    return SKILL_CATEGORIES.get(skill.lower().strip(), "Technical")

def analyze_skill_gaps(
    candidate_skills: List[str],
    target_role: str,
    target_skills: List[str] | None = None,
    job_description: str = ""
) -> SkillGapAnalysisResponse:
    cand_set = {s.lower().strip() for s in candidate_skills}

    role_key = "full stack"
    target_lower = target_role.lower()
    for key in ROLE_SKILL_CATALOG:
        if key in target_lower:
            role_key = key
            break

    catalog_data = ROLE_SKILL_CATALOG[role_key]

    # Combine provided target skills with role standard catalog
    all_targets = set([s.lower().strip() for s in (target_skills or [])])
    if not all_targets:
        all_targets = set(catalog_data["critical"] + catalog_data["recommended"])

    matched = sorted(list(cand_set & all_targets))
    missing = sorted(list(all_targets - cand_set))

    critical_gaps: List[SkillGapItem] = []
    recommended_gaps: List[SkillGapItem] = []

    for skill in missing:
        is_critical = skill in catalog_data["critical"] or len(critical_gaps) < 3
        gap_item = SkillGapItem(
            skill=skill,
            priority="critical" if is_critical else "recommended",
            category=_get_skill_category(skill),
            estimated_hours=25 if is_critical else 15,
            reason=f"Fundamental skill required for high-performing {target_role} roles."
        )
        if is_critical:
            critical_gaps.append(gap_item)
        else:
            recommended_gaps.append(gap_item)

    total_req = max(1, len(all_targets))
    match_pct = round((len(matched) / total_req) * 100, 1)

    if match_pct >= 80:
        readiness = "Ready to Apply"
    elif match_pct >= 55:
        readiness = "High Potential (1-2 Sprints)"
    elif match_pct >= 30:
        readiness = "Developing Candidate"
    else:
        readiness = "Foundational Stage"

    return SkillGapAnalysisResponse(
        target_role=target_role,
        matched_skills=matched,
        critical_gaps=critical_gaps,
        recommended_gaps=recommended_gaps,
        match_percentage=match_pct,
        readiness_level=readiness
    )
