from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

class InterviewQuestionItem(BaseModel):
    id: str
    question: str
    category: str = "technical"  # technical, behavioral, system_design
    expected_competency: str
    difficulty: str = "mid"
    follow_up_prompt: Optional[str] = None

class InterviewQuestionsGenerateRequest(BaseModel):
    role: str = Field(min_length=2, max_length=120)
    interview_type: str = "mixed"  # technical, behavioral, mixed
    difficulty: str = "mid"  # entry, mid, senior
    skills: List[str] = Field(default_factory=list)
    job_description: Optional[str] = None

class InterviewQuestionsGenerateResponse(BaseModel):
    role: str
    difficulty: str
    questions: List[InterviewQuestionItem]

class AnswerEvaluationRequest(BaseModel):
    role: str
    question: str
    answer: str = Field(min_length=2, max_length=10000)
    expected_competency: Optional[str] = ""

class AnswerEvaluationResponse(BaseModel):
    score: float = Field(ge=0.0, le=100.0)
    rubric_scores: Dict[str, float] = Field(
        default_factory=lambda: {
            "technical_accuracy": 75.0,
            "communication_clarity": 80.0,
            "star_adherence": 70.0,
            "relevance": 75.0,
        }
    )
    feedback: str
    key_strengths: List[str] = Field(default_factory=list)
    improvements: List[str] = Field(default_factory=list)

class SessionFinalizeRequest(BaseModel):
    role: str
    difficulty: str = "mid"
    answers: List[Dict[str, Any]] = Field(default_factory=list)

class SessionFinalizeResponse(BaseModel):
    overall_score: float
    rubric_summary: Dict[str, float]
    feedback_summary: Dict[str, Any]
