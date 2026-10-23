"""
Market analytics: aggregates skill demand from job posting data.
All output includes sample size and source coverage disclaimers.
"""

from pydantic import BaseModel, Field
from collections import Counter


class MarketAggregationRequest(BaseModel):
    job_skills_list: list[list[str]] = Field(
        description="List of skill sets from published job postings"
    )
    job_titles: list[str] = Field(default_factory=list)
    role_filter: str | None = None
    limit: int = Field(default=20, ge=1, le=100)


class SkillDemand(BaseModel):
    skill: str
    count: int
    frequency: float = Field(ge=0, le=1)


class MarketAggregationResult(BaseModel):
    top_skills: list[SkillDemand] = []
    role_breakdown: dict[str, int] = {}
    total_jobs_analyzed: int = 0
    data_note: str = ""


def aggregate_market_skills(request: MarketAggregationRequest) -> MarketAggregationResult:
    """Aggregate skill demand from a collection of job posting skill sets."""
    total = len(request.job_skills_list)
    if total == 0:
        return MarketAggregationResult(
            data_note="No job data available for analysis."
        )

    all_skills: list[str] = []
    for skill_set in request.job_skills_list:
        for s in skill_set:
            normalized = s.lower().strip()
            if normalized:
                all_skills.append(normalized)

    skill_counts = Counter(all_skills)
    top = skill_counts.most_common(request.limit)

    top_skills = [
        SkillDemand(
            skill=name,
            count=count,
            frequency=round(count / total, 3),
        )
        for name, count in top
    ]

    # Role/title breakdown
    role_counts: dict[str, int] = {}
    for title in request.job_titles:
        key = title.strip().lower() if title else "unspecified"
        role_counts[key] = role_counts.get(key, 0) + 1

    return MarketAggregationResult(
        top_skills=top_skills,
        role_breakdown=dict(Counter(role_counts).most_common(20)),
        total_jobs_analyzed=total,
        data_note=f"Based on {total} job listing(s) on this platform. Not representative of the broader labor market.",
    )
