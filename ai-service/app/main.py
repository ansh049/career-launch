from fastapi import FastAPI, UploadFile, File, HTTPException, Header
from pydantic import BaseModel, Field
from dotenv import load_dotenv
import os
import secrets
import time
from fastapi.responses import JSONResponse

load_dotenv()
from app.skills import extract_skills
from app.matching import match_jobs
from app.resume import extract_pdf_text
from app.explanations import explain_job_match
from app.parser import parse_resume

app = FastAPI(
    title="Career Platform AI",
    version="1.0.0"
)
_rate_limit_requests = int(os.getenv("AI_RATE_LIMIT_REQUESTS", "30"))
_rate_limit_window = int(os.getenv("AI_RATE_LIMIT_WINDOW_SECONDS", "60"))
_rate_limit_state: dict[str, tuple[int, float]] = {}
_rate_limited_paths = {
    "/internal/explain-match",
    "/internal/recommend",
    "/internal/parse-resume",
    "/analyze-text",
    "/analyze-pdf",
    "/match-jobs",
}


@app.middleware("http")
async def limit_ai_requests(request, call_next):
    if request.method == "POST" and request.url.path in _rate_limited_paths:
        now = time.monotonic()
        client_host = request.client.host if request.client else "unknown"
        key = f"{client_host}:{request.url.path}"
        count, expires_at = _rate_limit_state.get(key, (0, now + _rate_limit_window))

        if now >= expires_at:
            count, expires_at = 0, now + _rate_limit_window
        if count >= _rate_limit_requests:
            return JSONResponse(
                status_code=429,
                content={"detail": "AI request rate limit exceeded"},
                headers={"Retry-After": str(max(1, int(expires_at - now)))},
            )

        _rate_limit_state[key] = (count + 1, expires_at)
        if len(_rate_limit_state) > 8192:
            _rate_limit_state.update({
                entry_key: entry
                for entry_key, entry in _rate_limit_state.items()
                if entry[1] > now
            })

    return await call_next(request)

class ExplainRequest(BaseModel):
    job_title: str = Field(max_length=120)
    company: str = Field(max_length=120)
    matched_skills: list[str] = Field(max_length=50)
    missing_skills: list[str] = Field(max_length=50)
    similarity_score: float = Field(ge=0, le=100)


def require_internal_token(token: str) -> None:
    expected_token = os.environ.get("AI_INTERNAL_TOKEN", "")

    if not expected_token or not secrets.compare_digest(token, expected_token):
        raise HTTPException(status_code=401, detail="Unauthorized")


@app.post("/internal/explain-match")
def explain_match(
    request: ExplainRequest,
    x_internal_token: str = Header(default="")
):
    require_internal_token(x_internal_token)

    return {
        "success": True,
        "explanation": explain_job_match(
            job_title=request.job_title,
            company=request.company,
            matched_skills=request.matched_skills,
            missing_skills=request.missing_skills,
            similarity_score=request.similarity_score
        )
    }

class AnalyzeTextRequest(BaseModel):
    text: str = Field(min_length=20, max_length=100_000)


class MatchRequest(BaseModel):
    resume_text: str = Field(min_length=20, max_length=100_000)
    job_description: str = Field(min_length=20, max_length=20_000)
    job_skills: list[str] = Field(default_factory=list, max_length=100)

class JobItem(BaseModel):
    id: str
    title: str
    company: str
    description: str = ""
    skills: list[str] = Field(default_factory=list)
    location: str = ""
    job_type: str = ""
    work_mode: str = ""
    experience_level: str = ""


class RecommendRequest(BaseModel):
    resume_text: str = Field(min_length=10, max_length=100_000)
    candidate_skills: list[str] = Field(default_factory=list, max_length=100)
    jobs: list[JobItem] = Field(max_length=200)


@app.post("/internal/recommend")
def internal_recommend(
    request: RecommendRequest,
    x_internal_token: str = Header(default="")
):
    require_internal_token(x_internal_token)

    results = match_jobs(
        request.resume_text,
        [job.model_dump() for job in request.jobs],
        request.candidate_skills
    )

    return {
        "success": True,
        "recommendations": results
    }

@app.get("/")
def root():
    return {
        "success": True,
        "service": "career-ai",
        "health": "/health",
        "docs": "/docs",
    }


@app.get("/health")
def health():
    return {"success": True, "service": "career-ai"}


@app.post("/analyze-text")
def analyze_text(request: AnalyzeTextRequest):
    skills = extract_skills(request.text)

    return {
        "success": True,
        "skills": skills,
        "skill_count": len(skills)
    }


@app.post("/analyze-pdf")
async def analyze_pdf(
    file: UploadFile = File(...),
    x_internal_token: str = Header(default="")
):
    require_internal_token(x_internal_token)

    if file.content_type != "application/pdf":
        raise HTTPException(
            status_code=415,
            detail="Only PDF files are accepted"
        )

    pdf_bytes = await file.read(5 * 1024 * 1024 + 1)

    if len(pdf_bytes) > 5 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="PDF exceeds 5 MB")

    try:
        text = extract_pdf_text(pdf_bytes)
    except Exception as error:
        raise HTTPException(
            status_code=422,
            detail="Unable to extract text from this PDF"
        ) from error

    parsed = parse_resume(text)

    return {
        "success": True,
        "text": text,
        "skills": parsed["skills"],
        "skill_count": parsed["skill_count"],
        "contact_info": parsed["contact_info"],
        "education": parsed["education"],
        "summary": parsed["summary"],
        "headline": parsed["headline"],
        "categorized_skills": parsed["categorized_skills"],
    }


@app.post("/internal/parse-resume")
async def internal_parse_resume(
    file: UploadFile = File(...),
    x_internal_token: str = Header(default=""),
):
    require_internal_token(x_internal_token)

    if file.content_type != "application/pdf":
        raise HTTPException(
            status_code=415,
            detail="Only PDF files are accepted"
        )

    pdf_bytes = await file.read(5 * 1024 * 1024 + 1)

    if len(pdf_bytes) > 5 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="PDF exceeds 5 MB")

    try:
        text = extract_pdf_text(pdf_bytes)
    except Exception as error:
        raise HTTPException(
            status_code=422,
            detail="Unable to extract text from this PDF"
        ) from error

    parsed = parse_resume(text)

    return {
        "success": True,
        "text": text,
        "skills": parsed["skills"],
        "skill_count": parsed["skill_count"],
        "contact_info": parsed["contact_info"],
        "education": parsed["education"],
        "summary": parsed["summary"],
        "headline": parsed["headline"],
        "categorized_skills": parsed["categorized_skills"],
    }


@app.post("/match-jobs")
def recommend_jobs(request: AnalyzeTextRequest):
    # This endpoint accepts a resume as text.
    # The trusted Node API will provide the published jobs.
    return {
        "success": True,
        "resume_skills": extract_skills(request.text),
        "message": (
            "Call the internal matching service with published jobs "
            "to obtain ranked recommendations."
        )
    }


from app.career.schemas import SkillGapAnalysisRequest, RoadmapGenerateRequest
from app.career.skill_gap import analyze_skill_gaps
from app.career.roadmap import generate_career_roadmap


@app.post("/internal/career/gap-analysis")
def internal_gap_analysis(
    request: SkillGapAnalysisRequest,
    x_internal_token: str = Header(default="")
):
    require_internal_token(x_internal_token)
    result = analyze_skill_gaps(
        candidate_skills=request.candidate_skills,
        target_role=request.target_role,
        target_skills=request.target_skills,
        job_description=request.job_description or ""
    )
    return {"success": True, "analysis": result.model_dump()}


@app.post("/internal/career/roadmap")
def internal_generate_roadmap(
    request: RoadmapGenerateRequest,
    x_internal_token: str = Header(default="")
):
    require_internal_token(x_internal_token)
    result = generate_career_roadmap(request)
    return {"success": True, "roadmap": result.model_dump()}


from app.resume_copilot_schemas import ResumeCopilotAnalyzeRequest
from app.resume_copilot import analyze_and_tailor_resume


@app.post("/internal/resume-copilot/analyze")
def internal_resume_copilot_analyze(
    request: ResumeCopilotAnalyzeRequest,
    x_internal_token: str = Header(default="")
):
    require_internal_token(x_internal_token)
    result = analyze_and_tailor_resume(request)
    return {"success": True, "copilot": result.model_dump()}


from app.interviews.schemas import (
    InterviewQuestionsGenerateRequest,
    AnswerEvaluationRequest,
    SessionFinalizeRequest,
)
from app.interviews.questions import generate_interview_questions
from app.interviews.evaluation import evaluate_interview_answer, finalize_interview_session


@app.post("/internal/interviews/generate-questions")
def internal_interview_questions(
    request: InterviewQuestionsGenerateRequest,
    x_internal_token: str = Header(default="")
):
    require_internal_token(x_internal_token)
    result = generate_interview_questions(request)
    return {"success": True, "questionSet": result.model_dump()}


@app.post("/internal/interviews/evaluate-answer")
def internal_interview_evaluate(
    request: AnswerEvaluationRequest,
    x_internal_token: str = Header(default="")
):
    require_internal_token(x_internal_token)
    result = evaluate_interview_answer(request)
    return {"success": True, "evaluation": result.model_dump()}


@app.post("/internal/interviews/finalize-session")
def internal_interview_finalize(
    request: SessionFinalizeRequest,
    x_internal_token: str = Header(default="")
):
    require_internal_token(x_internal_token)
    result = finalize_interview_session(request)
    return {"success": True, "summary": result.model_dump()}


from app.agents.schemas import AgentRunRequest
from app.agents.graph import run_agent_workflow


@app.post("/internal/agent/run-step")
def internal_agent_run_step(
    request: AgentRunRequest,
    x_internal_token: str = Header(default="")
):
    require_internal_token(x_internal_token)
    result = run_agent_workflow(request)
    return {"success": True, "agent": result.model_dump()}


from app.risk.job_risk import JobRiskRequest, assess_job_risk


@app.post("/internal/risk/assess-job")
def internal_assess_job_risk(
    request: JobRiskRequest,
    x_internal_token: str = Header(default="")
):
    require_internal_token(x_internal_token)
    result = assess_job_risk(request)
    return {"success": True, "risk": result.model_dump()}


from app.graph.relationships import SkillRelationshipRequest, analyze_skill_relationships


@app.post("/internal/graph/skill-relationships")
def internal_skill_relationships(
    request: SkillRelationshipRequest,
    x_internal_token: str = Header(default="")
):
    require_internal_token(x_internal_token)
    result = analyze_skill_relationships(request)
    return {"success": True, "graph": result.model_dump()}


from app.recruiter.matching import RecruiterMatchRequest, match_candidates_to_job
from app.recruiter.interview_kit import InterviewKitRequest, generate_interview_kit as gen_kit


@app.post("/internal/recruiter/match-candidates")
def internal_recruiter_match(
    request: RecruiterMatchRequest,
    x_internal_token: str = Header(default="")
):
    require_internal_token(x_internal_token)
    result = match_candidates_to_job(request)
    return {"success": True, "recruiter": result.model_dump()}


@app.post("/internal/recruiter/interview-kit")
def internal_recruiter_interview_kit(
    request: InterviewKitRequest,
    x_internal_token: str = Header(default="")
):
    require_internal_token(x_internal_token)
    result = gen_kit(request)
    return {"success": True, "kit": result.model_dump()}


from app.market.aggregation import MarketAggregationRequest, aggregate_market_skills


@app.post("/internal/market/aggregate")
def internal_market_aggregate(
    request: MarketAggregationRequest,
    x_internal_token: str = Header(default="")
):
    require_internal_token(x_internal_token)
    result = aggregate_market_skills(request)
    return {"success": True, "market": result.model_dump()}


if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 10000))
    uvicorn.run("app.main:app", host="0.0.0.0", port=port)

