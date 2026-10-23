from app.graph.relationships import analyze_skill_relationships, categorize_skill, SkillRelationshipRequest


def test_categorize_skill():
    assert categorize_skill("react") == "framework"
    assert categorize_skill("docker") == "devops"
    assert categorize_skill("python") == "programming_language"


def test_analyze_skill_relationships():
    req = SkillRelationshipRequest(
        skills_list=[
            ["react", "typescript", "tailwind"],
            ["react", "typescript", "nextjs"],
            ["python", "fastapi", "docker"],
        ],
        min_co_occurrence=1,
    )
    result = analyze_skill_relationships(req)
    assert len(result.nodes) > 0
    assert len(result.edges) > 0
    # React and typescript co-occur
    react_ts = [
        e for e in result.edges
        if (e.source == "react" and e.target == "typescript") or
           (e.source == "typescript" and e.target == "react")
    ]
    assert len(react_ts) > 0

