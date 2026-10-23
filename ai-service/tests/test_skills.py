from app.skills import extract_skills


def test_extracts_known_skills():
    text = (
        "I use Python, React, MongoDB and machine learning "
        "to build web applications."
    )

    skills = extract_skills(text)

    assert "python" in skills
    assert "react" in skills
    assert "mongodb" in skills
    assert "machine learning" in skills


def test_empty_text_returns_no_skills():
    assert extract_skills("") == []