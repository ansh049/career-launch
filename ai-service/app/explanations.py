import json
import os

from groq import Groq

def _get_client() -> Groq:
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        raise RuntimeError("GROQ_API_KEY is required to generate match explanations")
    return Groq(api_key=api_key)


def explain_job_match(
    job_title: str,
    company: str,
    matched_skills: list[str],
    missing_skills: list[str],
    similarity_score: float
) -> dict:
    evidence = {
        "job_title": job_title,
        "company": company,
        "matched_skills": matched_skills,
        "missing_skills": missing_skills,
        "similarity_score": similarity_score
    }

    response = _get_client().chat.completions.create(
        model=os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile"),
        temperature=0.2,
        messages=[
            {
                "role": "system",
                "content": (
                    "You explain job relevance to candidates. "
                    "Use only the supplied evidence. Never invent "
                    "candidate experience, qualifications, or job "
                    "requirements. A similarity score is not a "
                    "probability of getting hired. Return valid JSON "
                    "with keys: summary, strengths, skill_gaps, next_steps. "
                    "strengths, skill_gaps, and next_steps must be arrays "
                    "of short strings."
                )
            },
            {
                "role": "user",
                "content": json.dumps(evidence)
            }
        ]
    )

    content = response.choices[0].message.content or "{}"

    try:
        parsed = json.loads(content)
    except json.JSONDecodeError:
        return {
            "summary": "A match explanation could not be generated.",
            "strengths": matched_skills,
            "skill_gaps": missing_skills,
            "next_steps": []
        }

    return {
        "summary": str(parsed.get("summary", ""))[:1000],
        "strengths": parsed.get("strengths", [])[:10],
        "skill_gaps": parsed.get("skill_gaps", [])[:10],
        "next_steps": parsed.get("next_steps", [])[:10]
    }