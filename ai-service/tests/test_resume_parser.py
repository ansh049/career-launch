import io
import pytest
from fastapi.testclient import TestClient
from pypdf import PdfWriter

from app.main import app
from app.parser import extract_contact_info, extract_education, parse_resume
from app.resume import extract_pdf_text
from app.skills import extract_skills

client = TestClient(app)

SAMPLE_RESUME_TEXT = """
Jane Doe
Software Engineer
San Francisco, CA
Email: jane.doe@example.com
Phone: +1 (555) 234-5678
LinkedIn: https://linkedin.com/in/janedoe
GitHub: https://github.com/janedoe

Professional Summary
Passionate full stack developer with experience building scalable distributed web applications and machine learning workflows.

Technical Skills
Languages & Frameworks: Python, JavaScript, TypeScript, React, Node.js, Express, FastAPI
Databases & Cloud: MongoDB, PostgreSQL, Redis, Docker, AWS, Git
AI & ML: Machine Learning, PyTorch, Scikit-learn

Education
Bachelor of Technology in Computer Science and Engineering
Stanford University
2019 - 2023 | CGPA: 3.9/4.0

Master of Science in Software Engineering
Carnegie Mellon University
2023 - 2025
"""


def test_extract_contact_info():
    info = extract_contact_info(SAMPLE_RESUME_TEXT)
    assert info["name"] == "Jane Doe"
    assert info["email"] == "jane.doe@example.com"
    assert "555" in info["phone"]
    assert "linkedin.com/in/janedoe" in info["links"].get("linkedin", "")
    assert "github.com/janedoe" in info["links"].get("github", "")


def test_extract_skills():
    skills = extract_skills(SAMPLE_RESUME_TEXT)
    assert "python" in skills
    assert "react" in skills
    assert "node.js" in skills
    assert "fastapi" in skills
    assert "mongodb" in skills
    assert "docker" in skills
    assert "aws" in skills
    assert "machine learning" in skills


def test_extract_education():
    education = extract_education(SAMPLE_RESUME_TEXT)
    assert len(education) >= 2

    degrees = [e["degree"] for e in education]
    assert any("Bachelor of Technology" in d for d in degrees)
    assert any("Master of Science" in d for d in degrees)

    institutions = [e["institution"] for e in education]
    assert any("Stanford" in inst for inst in institutions)

    years = [e["graduation_year"] for e in education]
    assert any("2019 - 2023" in y or "2023" in y for y in years)


def test_parse_resume_structure():
    parsed = parse_resume(SAMPLE_RESUME_TEXT)
    assert "contact_info" in parsed
    assert "skills" in parsed
    assert "education" in parsed
    assert "summary" in parsed
    assert "headline" in parsed
    assert parsed["skill_count"] > 5
    assert len(parsed["education"]) >= 2


def test_extract_pdf_text_with_pypdf():
    writer = PdfWriter()
    page = writer.add_blank_page(width=72, height=72)
    # Write sample text
    buffer = io.BytesIO()
    writer.write(buffer)
    pdf_bytes = buffer.getvalue()

    # Empty text page should raise ValueError
    with pytest.raises(ValueError, match="No selectable text"):
        extract_pdf_text(pdf_bytes)


def test_analyze_pdf_requires_internal_token(monkeypatch):
    monkeypatch.setenv("AI_INTERNAL_TOKEN", "valid-secret-token")

    # Request without token should fail with 401
    response = client.post(
        "/analyze-pdf",
        files={"file": ("resume.pdf", b"%PDF-1.4 empty", "application/pdf")},
        headers={"X-Internal-Token": "invalid-token"},
    )
    assert response.status_code == 401


def test_internal_parse_resume_requires_internal_token(monkeypatch):
    monkeypatch.setenv("AI_INTERNAL_TOKEN", "valid-secret-token")

    response = client.post(
        "/internal/parse-resume",
        files={"file": ("resume.pdf", b"%PDF-1.4 empty", "application/pdf")},
        headers={"X-Internal-Token": "invalid-token"},
    )
    assert response.status_code == 401
