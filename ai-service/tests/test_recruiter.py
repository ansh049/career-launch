from app.recruiter.matching import CandidateProfile, JobRequirements, RecruiterMatchRequest, match_candidates_to_job
from app.recruiter.interview_kit import generate_interview_kit, InterviewKitRequest


def test_recruiter_matching():
    candidates = [
        CandidateProfile(
            candidate_id="c1",
            name="Alice",
            skills=["Python", "FastAPI", "Docker", "PostgreSQL"],
        ),
        CandidateProfile(
            candidate_id="c2",
            name="Bob",
            skills=["JavaScript", "React", "CSS"],
        ),
    ]

    req = RecruiterMatchRequest(
        job=JobRequirements(
            job_id="j1",
            title="Backend Engineer",
            skills=["Python", "FastAPI", "Docker"],
        ),
        candidates=candidates,
    )

    resp = match_candidates_to_job(req)

    assert len(resp.matches) == 2
    # Alice should be higher match than Bob
    assert resp.matches[0].candidate_id == "c1"
    assert resp.matches[0].match_score > resp.matches[1].match_score
    assert "python" in resp.matches[0].matched_skills


def test_interview_kit_generation():
    req = InterviewKitRequest(
        job_id="job123",
        title="Full Stack Developer",
        skills=["React", "Node.js", "MongoDB"],
        experience_level="Mid-level",
    )
    kit = generate_interview_kit(req)
    assert kit.job_id == "job123"
    assert len(kit.questions) > 0
    assert kit.questions[0].rubric != ""
    assert len(kit.evaluation_guidelines) > 0
