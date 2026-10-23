from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

class ResumeSuggestionItem(BaseModel):
    id: str
    section: str = Field(description="'summary', 'experience', or 'skills'")
    original_text: str
    suggested_text: str
    reason: str
    impact_factor: str = "High"  # High, Medium, Optimization
    status: str = "pending"  # pending, accepted, rejected, edited
    edited_text: Optional[str] = None

class ResumeCopilotAnalyzeRequest(BaseModel):
    resume_text: str = Field(min_length=10, max_length=100_000)
    job_title: str
    job_description: str = Field(max_length=30_000)
    job_skills: List[str] = Field(default_factory=list)
    candidate_skills: List[str] = Field(default_factory=list)

class ResumeCopilotAnalyzeResponse(BaseModel):
    summary_suggestions: List[ResumeSuggestionItem]
    experience_suggestions: List[ResumeSuggestionItem]
    skills_suggestions: List[ResumeSuggestionItem]
    tailored_headline: str
    keyword_alignment_score: float
