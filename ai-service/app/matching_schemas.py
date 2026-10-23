from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

class ComponentScores(BaseModel):
    semantic_score: float = Field(ge=0.0, le=100.0, description="Semantic embedding similarity score")
    skill_score: float = Field(ge=0.0, le=100.0, description="Required skill coverage percentage")
    experience_score: float = Field(ge=0.0, le=100.0, description="Experience level compatibility score")
    scoring_version: str = Field(default="v2.0")
    weights: Dict[str, float] = Field(
        default_factory=lambda: {"semantic": 0.50, "skill": 0.35, "experience": 0.15}
    )

class SkillEvidenceItem(BaseModel):
    skill: str
    found_in: str

class MatchEvidence(BaseModel):
    matched_skills: List[SkillEvidenceItem]
    missing_skills: List[str]
    experience_fit: str

class ExplainableMatchResult(BaseModel):
    job_id: str
    title: str
    company: str
    location: str = ""
    job_type: str = ""
    work_mode: str = ""
    experience_level: str = ""
    similarity_score: float
    score_components: ComponentScores
    matched_skills: List[str]
    missing_skills: List[str]
    required_skills: List[str]
    match_level: str
    evidence: MatchEvidence
    scoring_version: str = "v2.0"

class RecommendationFeedbackSchema(BaseModel):
    user_id: str
    job_id: str
    feedback: str
    rating: Optional[int] = None
    notes: Optional[str] = None
    scoring_version: str = "v2.0"
