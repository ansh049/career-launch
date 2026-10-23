import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.matching import match_jobs

client = TestClient(app)

SAMPLE_RESUME = """
Jane Doe
Full Stack Software Developer
Experience with Python, React, FastAPI, Node.js, and MongoDB.
Built REST APIs, microservices, and modern web applications with Docker and AWS.
"""

SAMPLE_JOBS = [
    {
        "id": "job-1",
        "title": "Full Stack Python & React Engineer",
        "company": "Tech Corp",
        "description": "We need a Full Stack Developer experienced with Python, FastAPI, React, and MongoDB.",
        "skills": ["python", "react", "fastapi", "mongodb", "docker", "aws"],
        "location": "San Francisco, CA",
        "job_type": "full-time",
    },
    {
        "id": "job-2",
        "title": "Dentist / Clinical Assistant",
        "company": "Dental Care Clinic",
        "description": "Provide patient care, cleanings, and clinical support in a dental clinic environment.",
        "skills": ["patient care", "dental hygiene", "radiology"],
        "location": "New York, NY",
        "job_type": "full-time",
    },
]


def test_semantic_matching_ranks_relevant_job_higher():
    results = match_jobs(SAMPLE_RESUME, SAMPLE_JOBS, candidate_skills=["python", "react", "fastapi"])

    assert len(results) == 2
    # The tech job should be ranked first
    assert results[0]["job_id"] == "job-1"
    assert results[0]["title"] == "Full Stack Python & React Engineer"
    # Tech job similarity score must be substantially higher than the dentist job
    assert results[0]["similarity_score"] > results[1]["similarity_score"]
    assert results[0]["similarity_score"] > 40.0


def test_skill_gap_analysis():
    results = match_jobs(SAMPLE_RESUME, SAMPLE_JOBS, candidate_skills=["python", "react"])
    tech_job = next(r for r in results if r["job_id"] == "job-1")

    # Matched skills
    assert "python" in tech_job["matched_skills"]
    assert "react" in tech_job["matched_skills"]

    # All required skills should be accounted for in either matched or missing
    required = set(tech_job["required_skills"])
    matched = set(tech_job["matched_skills"])
    missing = set(tech_job["missing_skills"])

    assert required == (matched | missing)
    assert matched.isdisjoint(missing)


def test_match_jobs_empty_list():
    assert match_jobs(SAMPLE_RESUME, []) == []


def test_internal_recommend_endpoint_auth(monkeypatch):
    monkeypatch.setenv("AI_INTERNAL_TOKEN", "valid-token-123")

    payload = {
        "resume_text": SAMPLE_RESUME,
        "candidate_skills": ["python", "react"],
        "jobs": [
            {
                "id": "job-1",
                "title": "Python Dev",
                "company": "Tech Corp",
                "description": "Python web development with FastAPI",
                "skills": ["python", "fastapi"],
            }
        ],
    }

    # Rejects invalid token
    res_bad = client.post(
        "/internal/recommend",
        json=payload,
        headers={"X-Internal-Token": "bad-token"},
    )
    assert res_bad.status_code == 401

    # Accepts valid token
    res_good = client.post(
        "/internal/recommend",
        json=payload,
        headers={"X-Internal-Token": "valid-token-123"},
    )
    assert res_good.status_code == 200
    data = res_good.json()
    assert data["success"] is True
    assert len(data["recommendations"]) == 1
    assert data["recommendations"][0]["job_id"] == "job-1"
    assert "python" in data["recommendations"][0]["matched_skills"]
