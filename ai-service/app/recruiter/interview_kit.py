"""
Structured interview kit generation for recruiters.
Produces role-specific questions with evaluation rubrics.
"""

from pydantic import BaseModel, Field


class InterviewKitRequest(BaseModel):
    job_id: str
    title: str = ""
    company: str = ""
    skills: list[str] = []
    experience_level: str = ""
    description: str = ""


class InterviewQuestion(BaseModel):
    id: str
    type: str  # technical, behavioral, leadership, situational
    question: str
    rubric: str
    skill: str | None = None


class InterviewKitResult(BaseModel):
    job_id: str
    questions: list[InterviewQuestion] = []
    evaluation_guidelines: list[str] = []


def generate_interview_kit(request: InterviewKitRequest) -> InterviewKitResult:
    """Generate a structured interview kit based on job requirements."""
    questions: list[InterviewQuestion] = []

    # Technical questions from required skills
    for i, skill in enumerate(request.skills[:5]):
        questions.append(InterviewQuestion(
            id=f"tech-{i + 1}",
            type="technical",
            question=f"Describe a project where you used {skill}. What challenges did you face and how did you solve them?",
            rubric=f"Look for: specific examples, problem-solving approach, depth of {skill} knowledge, and impact of the solution.",
            skill=skill,
        ))

    # Behavioral questions
    behavioral = [
        ("Tell me about a time you had to meet a tight deadline. How did you manage your priorities?",
         "STAR method. Look for: time management, prioritization, outcome."),
        ("Describe a situation where you disagreed with a team decision. How did you handle it?",
         "Look for: professionalism, communication, willingness to compromise, outcome focus."),
        ("Give an example of when you learned a new technology or skill quickly to complete a project.",
         "Look for: learning agility, initiative, practical application of the new skill."),
    ]
    for i, (q, r) in enumerate(behavioral):
        questions.append(InterviewQuestion(
            id=f"beh-{i + 1}", type="behavioral", question=q, rubric=r,
        ))

    # Leadership questions for senior roles
    if request.experience_level in ("senior", "lead", "principal", "staff"):
        questions.append(InterviewQuestion(
            id="lead-1",
            type="leadership",
            question="Describe your experience mentoring junior team members or leading technical decisions.",
            rubric="Look for: mentorship examples, delegation, technical decision-making, team impact.",
        ))
        questions.append(InterviewQuestion(
            id="lead-2",
            type="leadership",
            question="How do you approach balancing technical debt with feature delivery?",
            rubric="Look for: pragmatism, stakeholder communication, long-term thinking.",
        ))

    return InterviewKitResult(
        job_id=request.job_id,
        questions=questions,
        evaluation_guidelines=[
            "Use the same question set for all candidates to ensure fairness.",
            "Score each answer 1-5 using the provided rubric.",
            "Take notes during the interview; do not rely solely on memory.",
            "AI match scores are supplementary context, not a final ranking.",
            "Evaluate candidates against job requirements, not against each other.",
        ],
    )
