from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

class SkillGapItem(BaseModel):
    skill: str
    priority: str = Field(description="'critical', 'recommended', or 'optional'")
    category: str = Field(default="Technical", description="Skill category, e.g. Frontend, Backend, Cloud")
    estimated_hours: int = Field(default=20, ge=1, le=500)
    reason: str = Field(default="", description="Why this skill is needed for the target role")

class SkillGapAnalysisRequest(BaseModel):
    candidate_skills: List[str] = Field(default_factory=list)
    target_role: str = Field(min_length=2, max_length=120)
    target_skills: List[str] = Field(default_factory=list)
    job_description: Optional[str] = Field(default="", max_length=20000)

class SkillGapAnalysisResponse(BaseModel):
    target_role: str
    matched_skills: List[str]
    critical_gaps: List[SkillGapItem]
    recommended_gaps: List[SkillGapItem]
    match_percentage: float = Field(ge=0.0, le=100.0)
    readiness_level: str

class LearningResource(BaseModel):
    title: str
    type: str = "documentation"  # documentation, tutorial, course, book
    url: Optional[str] = None
    estimated_time: Optional[str] = "4-8 hours"

class ProjectRecommendation(BaseModel):
    title: str
    description: str
    deliverables: List[str] = Field(default_factory=list)
    skills: List[str] = Field(default_factory=list)

class MilestoneSchema(BaseModel):
    id: str
    title: str
    phase: str  # Phase 1: Core Fundamentals, Phase 2: Applied Engineering, Phase 3: Production & Capstone
    description: str
    skills: List[str]
    estimated_hours: int = 30
    resources: List[LearningResource] = Field(default_factory=list)
    projects: List[ProjectRecommendation] = Field(default_factory=list)
    status: str = "not_started"

class RoadmapGenerateRequest(BaseModel):
    candidate_skills: List[str] = Field(default_factory=list)
    target_role: str = Field(min_length=2, max_length=120)
    target_job_id: Optional[str] = None
    target_skills: List[str] = Field(default_factory=list)
    current_level: Optional[str] = "Junior"

class RoadmapGenerateResponse(BaseModel):
    target_role: str
    summary: str
    milestones: List[MilestoneSchema]
    total_estimated_hours: int
    readiness_score: float
