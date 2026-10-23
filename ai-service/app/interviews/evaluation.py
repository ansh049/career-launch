import os
import json
from app.interviews.schemas import (
    AnswerEvaluationRequest,
    AnswerEvaluationResponse,
    SessionFinalizeRequest,
    SessionFinalizeResponse,
)

def evaluate_interview_answer(request: AnswerEvaluationRequest) -> AnswerEvaluationResponse:
    answer_text = request.answer.strip()
    words = answer_text.split()
    word_count = len(words)

    # Deterministic rubric baseline
    tech_score = 75.0
    comm_score = 75.0
    star_score = 70.0
    rel_score = 75.0

    # Rewards structured, detailed answers
    if word_count > 60:
        comm_score += 10.0
    if word_count > 120:
        tech_score += 10.0

    # Checks for STAR keywords in behavioral responses (Situation, Task, Action, Result)
    lower_ans = answer_text.lower()
    if any(k in lower_ans for k in ["situation", "task", "action", "result", "because", "impact", "metric", "improved"]):
        star_score += 15.0

    # Cap at 95.0
    tech_score = min(95.0, max(40.0, tech_score))
    comm_score = min(95.0, max(40.0, comm_score))
    star_score = min(95.0, max(40.0, star_score))
    rel_score = min(95.0, max(40.0, rel_score))

    avg_score = round((tech_score * 0.35 + comm_score * 0.25 + star_score * 0.20 + rel_score * 0.20), 1)

    strengths = [
        "Structured explanation with clear logical progression",
        "Demonstrated technical command and domain awareness",
    ]
    improvements = [
        "Incorporate specific quantifiable metrics (e.g. % improvement in latency or user engagement)",
        "Deepen discussion on edge cases and failure mode handling",
    ]

    feedback = (
        f"Solid response demonstrating competence for {request.role}. "
        f"You communicated core concepts clearly. To elevate your answer to top-percentile, "
        f"highlight specific business outcomes, trade-offs, and lessons learned."
    )

    return AnswerEvaluationResponse(
        score=avg_score,
        rubric_scores={
            "technical_accuracy": tech_score,
            "communication_clarity": comm_score,
            "star_adherence": star_score,
            "relevance": rel_score,
        },
        feedback=feedback,
        key_strengths=strengths,
        improvements=improvements
    )


def finalize_interview_session(request: SessionFinalizeRequest) -> SessionFinalizeResponse:
    answers = request.answers or []
    if not answers:
        return SessionFinalizeResponse(
            overall_score=75.0,
            rubric_summary={"technicalFit": 75.0, "communication": 75.0, "problemSolving": 75.0},
            feedback_summary={
                "strengths": ["Completed mock session"],
                "improvementAreas": ["Practice answering in full STAR format"],
                "recommendations": ["Review fundamentals before technical screening"],
            }
        )

    scores = [a.get("score", 75.0) for a in answers]
    overall = round(sum(scores) / max(1, len(scores)), 1)

    return SessionFinalizeResponse(
        overall_score=overall,
        rubric_summary={
            "technicalFit": overall,
            "communication": min(95.0, overall + 2.0),
            "problemSolving": min(95.0, overall - 2.0),
            "experienceRelevance": overall,
        },
        feedback_summary={
            "strengths": [
                f"Consistent technical reasoning across {len(answers)} interview questions",
                "Clear communication and willingness to explain architectural choices",
            ],
            "improvementAreas": [
                "Quantify impact with concrete KPIs in behavioral scenarios",
                "Elaborate more proactively on system design constraints and edge conditions",
            ],
            "recommendations": [
                "Practice mock system design scenarios for high-concurrency systems",
                "Structure project stories around STAR: Situation, Task, Action, and Measurable Result",
            ],
        }
    )
