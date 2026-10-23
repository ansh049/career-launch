from fastapi.testclient import TestClient
from app.main import app
from app.risk.job_risk import assess_job_risk, JobRiskRequest

client = TestClient(app)


def test_assess_job_risk_clean_job():
    req = JobRiskRequest(
        job_id="job-clean-1",
        title="Senior Backend Engineer",
        description="We are looking for a skilled Node.js / Python engineer to join our cloud platform team. Competitive benefits and healthcare provided.",
        company="Reputable Tech Corp",
        location="Remote, USA",
        salary="$140,000 - $180,000",
        contact_email="careers@reputabletech.com",
    )
    result = assess_job_risk(req)
    assert result.risk_level in ["low", "clean"]
    assert result.risk_score < 40


def test_assess_job_risk_suspicious_payment():
    req = JobRiskRequest(
        job_id="job-risk-1",
        title="Immediate Data Entry Clerk",
        description="Earn $100/hr from home! Wire transfer registration fee of $50 required to receive starter kit. Must act now, urgent positions available!",
        company="Quick Cash LLC",
        contact_email="hiring.quickcash@gmail.com",
    )
    result = assess_job_risk(req)
    assert result.risk_score >= 0.5
    assert result.risk_level in ["high", "critical"]
    assert len(result.indicators) > 0


def test_internal_risk_endpoint_auth(monkeypatch):
    monkeypatch.setenv("AI_INTERNAL_TOKEN", "valid-secret")
    response = client.post(
        "/internal/risk/assess-job",
        json={"job_id": "job-1", "title": "Test Engineer", "description": "Software development"},
        headers={"X-Internal-Token": "invalid-secret"},
    )
    assert response.status_code == 401
