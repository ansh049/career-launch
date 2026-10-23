import os
import json
import uuid
from typing import List
from app.interviews.schemas import (
    InterviewQuestionsGenerateRequest,
    InterviewQuestionsGenerateResponse,
    InterviewQuestionItem,
)

ROLE_QUESTION_TEMPLATES = {
    "frontend": [
        {
            "question": "How do you optimize rendering performance in React applications when dealing with large lists or frequent state updates?",
            "category": "technical",
            "expected_competency": "React Virtual DOM, useMemo/useCallback, virtualization, reconciliation",
            "follow_up_prompt": "Can you discuss a specific scenario where you diagnosed a re-render bottleneck with React Profiler?",
        },
        {
            "question": "Tell me about a time when you had to balance pixel-perfect design requirements with tight release deadlines.",
            "category": "behavioral",
            "expected_competency": "Communication with designers, pragmatic trade-offs, STAR format",
            "follow_up_prompt": "How did you manage stakeholder expectations throughout that sprint?",
        },
        {
            "question": "How do you handle state management across deeply nested components in modern frontend architecture?",
            "category": "technical",
            "expected_competency": "Redux Toolkit, Context API, Zustand, state separation",
            "follow_up_prompt": "When would you prefer Context API over a global store like Redux?",
        },
    ],
    "backend": [
        {
            "question": "Explain how you design a resilient, idempotent RESTful or RPC endpoint that handles payment or database transactions.",
            "category": "technical",
            "expected_competency": "ACID compliance, idempotency keys, distributed locks, error handling",
            "follow_up_prompt": "What happens if the network drops between database write and client response?",
        },
        {
            "question": "Describe a production outage or critical bug you investigated and resolved under pressure.",
            "category": "behavioral",
            "expected_competency": "Root-cause analysis, structured debugging, calm communication, post-mortem",
            "follow_up_prompt": "What preventative measures did you introduce to avoid recurrence?",
        },
        {
            "question": "How do you approach indexing strategies in MongoDB or PostgreSQL when query latency spikes under high read volume?",
            "category": "system_design",
            "expected_competency": "Compound indexes, execution plans (explain), B-trees, caching with Redis",
            "follow_up_prompt": "What are the trade-offs of adding more indexes on write-heavy collections?",
        },
    ],
    "default": [
        {
            "question": "Walk me through an end-to-end project where you designed the architecture from requirements to production deployment.",
            "category": "technical",
            "expected_competency": "Full lifecycle ownership, architectural decisions, clean abstractions",
            "follow_up_prompt": "If you had to scale that system to 100x traffic tomorrow, what would break first?",
        },
        {
            "question": "Describe a situation where you had a strong technical disagreement with a teammate. How did you resolve it?",
            "category": "behavioral",
            "expected_competency": "Empathy, objective data-driven decision making, conflict resolution",
            "follow_up_prompt": "Did the decision prove correct in hindsight?",
        },
        {
            "question": "How do you ensure test coverage, security best practices, and code quality before merging PRs?",
            "category": "technical",
            "expected_competency": "Unit/integration testing, CI/CD pipelines, security headers, OWASP awareness",
            "follow_up_prompt": "What is your philosophy on automated testing versus manual QA?",
        },
    ],
}

def generate_interview_questions(request: InterviewQuestionsGenerateRequest) -> InterviewQuestionsGenerateResponse:
    role_lower = request.role.lower()
    selected_key = "default"
    for key in ROLE_QUESTION_TEMPLATES:
        if key in role_lower:
            selected_key = key
            break

    template_list = ROLE_QUESTION_TEMPLATES[selected_key]
    items = []

    for t in template_list:
        items.append(
            InterviewQuestionItem(
                id=f"q-{uuid.uuid4().hex[:8]}",
                question=t["question"],
                category=t["category"],
                expected_competency=t["expected_competency"],
                difficulty=request.difficulty,
                follow_up_prompt=t.get("follow_up_prompt")
            )
        )

    # If candidate skills provided, add one skill-specific technical prompt
    if request.skills:
        skill_name = request.skills[0].title()
        items.append(
            InterviewQuestionItem(
                id=f"q-{uuid.uuid4().hex[:8]}",
                question=f"Can you explain a complex problem you solved using {skill_name} and the architectural trade-offs you made?",
                category="technical",
                expected_competency=f"Deep practical mastery of {skill_name}",
                difficulty=request.difficulty,
                follow_up_prompt="What alternative approach did you consider before choosing that solution?"
            )
        )

    return InterviewQuestionsGenerateResponse(
        role=request.role,
        difficulty=request.difficulty,
        questions=items
    )
