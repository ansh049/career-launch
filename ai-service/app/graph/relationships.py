"""
Skill relationship analysis for the Career Knowledge Graph.
Derives skill relationships from job posting co-occurrence patterns.
"""

from pydantic import BaseModel, Field


class SkillNode(BaseModel):
    name: str
    category: str = "other"
    frequency: float = 0


class SkillEdge(BaseModel):
    source: str
    target: str
    relationship_type: str = "related"
    confidence: float = Field(ge=0, le=1, default=0.5)
    co_occurrence_count: int = 0


class SkillGraphResult(BaseModel):
    nodes: list[SkillNode] = []
    edges: list[SkillEdge] = []


class SkillRelationshipRequest(BaseModel):
    skills_list: list[list[str]] = Field(
        description="List of skill sets (each set from a single job posting)"
    )
    min_co_occurrence: int = Field(default=2, ge=1)
    max_edges: int = Field(default=200, ge=1, le=1000)


_SKILL_CATEGORIES = {
    "python": "programming_language", "javascript": "programming_language",
    "java": "programming_language", "typescript": "programming_language",
    "c++": "programming_language", "go": "programming_language",
    "rust": "programming_language", "ruby": "programming_language",
    "c#": "programming_language", "php": "programming_language",
    "swift": "programming_language", "kotlin": "programming_language",
    "react": "framework", "angular": "framework", "vue": "framework",
    "django": "framework", "flask": "framework", "express": "framework",
    "next.js": "framework", "spring": "framework", "rails": "framework",
    "fastapi": "framework", "node.js": "framework",
    "postgresql": "database", "mongodb": "database", "mysql": "database",
    "redis": "database", "elasticsearch": "database", "dynamodb": "database",
    "aws": "cloud", "azure": "cloud", "gcp": "cloud",
    "docker": "devops", "kubernetes": "devops", "terraform": "devops",
    "jenkins": "devops", "ci/cd": "devops", "github actions": "devops",
    "machine learning": "data_science", "deep learning": "data_science",
    "nlp": "data_science", "tensorflow": "data_science",
    "pytorch": "data_science", "pandas": "data_science",
    "figma": "design", "sketch": "design", "adobe xd": "design",
    "leadership": "soft_skill", "communication": "soft_skill",
    "agile": "soft_skill", "scrum": "soft_skill",
}


def categorize_skill(name: str) -> str:
    normalized = name.lower().strip()
    return _SKILL_CATEGORIES.get(normalized, "other")


def analyze_skill_relationships(request: SkillRelationshipRequest) -> SkillGraphResult:
    """Build a co-occurrence graph from skill sets extracted from job postings."""
    skill_freq: dict[str, int] = {}
    co_occurrence: dict[str, int] = {}
    total_sets = len(request.skills_list)

    for skill_set in request.skills_list:
        normalized = list(set(s.lower().strip() for s in skill_set if s.strip()))
        for skill in normalized:
            skill_freq[skill] = skill_freq.get(skill, 0) + 1

        # Count pairwise co-occurrences
        for i in range(len(normalized)):
            for j in range(i + 1, len(normalized)):
                pair = tuple(sorted([normalized[i], normalized[j]]))
                key = f"{pair[0]}|||{pair[1]}"
                co_occurrence[key] = co_occurrence.get(key, 0) + 1

    # Build nodes
    nodes = [
        SkillNode(
            name=name,
            category=categorize_skill(name),
            frequency=round(count / max(total_sets, 1), 3),
        )
        for name, count in sorted(skill_freq.items(), key=lambda x: -x[1])
    ]

    # Build edges (only pairs co-occurring at least min_co_occurrence times)
    edges = []
    for key, count in sorted(co_occurrence.items(), key=lambda x: -x[1]):
        if count < request.min_co_occurrence:
            continue
        if len(edges) >= request.max_edges:
            break

        source, target = key.split("|||")
        confidence = min(1.0, count / (max(total_sets, 1) * 0.5))

        edges.append(SkillEdge(
            source=source,
            target=target,
            relationship_type="related",
            confidence=round(confidence, 3),
            co_occurrence_count=count,
        ))

    return SkillGraphResult(nodes=nodes, edges=edges)
