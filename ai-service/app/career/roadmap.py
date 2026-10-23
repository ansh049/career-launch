from typing import List
from app.career.schemas import (
    RoadmapGenerateRequest,
    RoadmapGenerateResponse,
    MilestoneSchema,
    LearningResource,
    ProjectRecommendation,
)
from app.career.skill_gap import analyze_skill_gaps

def generate_career_roadmap(request: RoadmapGenerateRequest) -> RoadmapGenerateResponse:
    # 1. First run skill gap analysis to identify missing competencies
    gap_analysis = analyze_skill_gaps(
        candidate_skills=request.candidate_skills,
        target_role=request.target_role,
        target_skills=request.target_skills
    )

    missing_critical = [item.skill for item in gap_analysis.critical_gaps]
    missing_recommended = [item.skill for item in gap_analysis.recommended_gaps]

    # Partition skills across 3 phased milestones
    phase1_skills = missing_critical[:3] if missing_critical else ["Core Fundamentals", "Architecture"]
    phase2_skills = (missing_critical[3:] + missing_recommended[:2]) or ["Advanced Patterns", "Testing"]
    phase3_skills = (missing_recommended[2:] + ["Production Deployment", "Monitoring"])

    # Milestone 1: Foundations
    m1 = MilestoneSchema(
        id="m-1",
        title=f"Phase 1: Core Mastery ({', '.join(phase1_skills[:2]).title()})",
        phase="Phase 1: Core Fundamentals",
        description=f"Deep-dive into essential foundational technologies for {request.target_role}. Build solid conceptual and practical knowledge.",
        skills=phase1_skills,
        estimated_hours=len(phase1_skills) * 15,
        resources=[
            LearningResource(
                title=f"Official {s.title()} Documentation & Guides",
                type="documentation",
                url=f"https://devdocs.io/#q={s.lower()}",
                estimated_time="6-10 hours"
            )
            for s in phase1_skills[:3]
        ],
        projects=[
            ProjectRecommendation(
                title=f"Interactive {request.target_role} Starter Application",
                description=f"Implement a hands-on project utilizing {', '.join(phase1_skills)} with structured error handling and clean modular code.",
                deliverables=["GitHub repository with README", "Unit tests for core functions", "Configured linter & formatter"],
                skills=phase1_skills
            )
        ],
        status="not_started"
    )

    # Milestone 2: Applied Architecture
    m2 = MilestoneSchema(
        id="m-2",
        title=f"Phase 2: Applied Architecture ({', '.join(phase2_skills[:2]).title()})",
        phase="Phase 2: Applied Architecture",
        description=f"Integrate modern workflows, intermediate tooling, and robust design patterns relevant to {request.target_role}.",
        skills=phase2_skills,
        estimated_hours=len(phase2_skills) * 18,
        resources=[
            LearningResource(
                title=f"Modern {s.title()} Architectural Patterns",
                type="tutorial",
                url=f"https://github.com/topics/{s.lower()}",
                estimated_time="8-12 hours"
            )
            for s in phase2_skills[:3]
        ],
        projects=[
            ProjectRecommendation(
                title="Full-Feature Microservice or Interactive Dashboard",
                description=f"Construct an end-to-end component integrating {', '.join(phase2_skills)} with database persistence and caching.",
                deliverables=["REST/GraphQL API endpoints", "Database migrations & seeders", "Dockerized development environment"],
                skills=phase2_skills
            )
        ],
        status="not_started"
    )

    # Milestone 3: Production Capstone
    m3 = MilestoneSchema(
        id="m-3",
        title="Phase 3: Production Engineering & Capstone Release",
        phase="Phase 3: Production & Capstone",
        description=f"Demonstrate end-to-end industry readiness for {request.target_role} with a deployed, secure capstone project.",
        skills=phase3_skills,
        estimated_hours=40,
        resources=[
            LearningResource(
                title="Production Checklist, Security Best Practices, and CI/CD",
                type="documentation",
                url="https://owasp.org/www-project-top-ten/",
                estimated_time="10 hours"
            ),
            LearningResource(
                title="System Design Interview Preparation",
                type="course",
                url="https://github.com/donnemartin/system-design-primer",
                estimated_time="12 hours"
            )
        ],
        projects=[
            ProjectRecommendation(
                title=f"{request.target_role} Industry Capstone",
                description="A deployed, demonstrable application showcasing complete lifecycle: authentication, security, observability, and cloud deployment.",
                deliverables=["Live deployed demo URL", "CI/CD automated pipeline (GitHub Actions)", "Comprehensive architectural documentation"],
                skills=phase3_skills
            )
        ],
        status="not_started"
    )

    milestones = [m1, m2, m3]
    total_hours = sum(m.estimated_hours for m in milestones)

    return RoadmapGenerateResponse(
        target_role=request.target_role,
        summary=(
            f"Personalized 3-phase career roadmap tailored for {request.target_role}. "
            f"Bridges {len(missing_critical)} critical competencies and {len(missing_recommended)} "
            f"recommended skills with hands-on practice projects."
        ),
        milestones=milestones,
        total_estimated_hours=total_hours,
        readiness_score=gap_analysis.match_percentage
    )
