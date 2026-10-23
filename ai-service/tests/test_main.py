from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_root_returns_service_status():
    response = client.get("/")

    assert response.status_code == 200
    assert response.json() == {
        "success": True,
        "service": "career-ai",
        "health": "/health",
        "docs": "/docs",
    }


def test_internal_recommend_requires_valid_token(monkeypatch):
    monkeypatch.setenv("AI_INTERNAL_TOKEN", "expected-test-token")

    response = client.post(
        "/internal/recommend",
        json={"resume_text": "A sufficiently long candidate resume text", "jobs": []},
        headers={"X-Internal-Token": "wrong-token"},
    )

    assert response.status_code == 401