from app.market.aggregation import aggregate_market_skills, MarketAggregationRequest


def test_market_aggregation():
    req = MarketAggregationRequest(
        job_skills_list=[
            ["React", "JavaScript", "CSS"],
            ["React", "Node.js", "TypeScript"],
            ["Node.js", "MongoDB", "Docker"],
        ],
        limit=5,
    )
    result = aggregate_market_skills(req)
    assert result.total_jobs_analyzed == 3
    assert len(result.top_skills) > 0
    top_skill_names = [s.skill.lower() for s in result.top_skills]
    assert "react" in top_skill_names or "node.js" in top_skill_names
    assert "not representative" in result.data_note.lower() or "broader labor market" in result.data_note.lower()
