"""
Job scam/risk detection using heuristic signals.
Analyzes job listing content for suspicious patterns without making
categorical fraud determinations — flags are informational signals
for human review.
"""

from pydantic import BaseModel, Field
import re


class RiskIndicator(BaseModel):
    type: str
    signal: str
    confidence: float = Field(ge=0, le=1)


class RiskAssessmentResult(BaseModel):
    indicators: list[RiskIndicator] = []
    risk_score: float = Field(ge=0, le=1, default=0)
    risk_level: str = "low"  # low, medium, high, critical
    model_version: str = "heuristic-1.0"


class JobRiskRequest(BaseModel):
    job_id: str
    title: str = ""
    company: str = ""
    description: str = ""
    salary_min: float | None = None
    salary_max: float | None = None
    location: str = ""
    contact_email: str = ""
    posted_by: str = ""


_PAYMENT_PHRASES = [
    "pay to apply", "registration fee", "training fee", "advance payment",
    "wire transfer", "send money", "processing fee", "pay upfront",
    "deposit required", "membership fee", "investment required",
]

_URGENCY_PHRASES = [
    "urgent hiring", "immediate joiner only", "start today",
    "act now", "limited positions", "don't miss this",
    "once in a lifetime", "guaranteed income",
]

_IMPERSONATION_SIGNALS = [
    "work from home guaranteed", "no experience needed earn",
    "be your own boss", "unlimited earning potential",
    "secret shopper", "envelope stuffing",
]


def assess_job_risk(request: JobRiskRequest) -> RiskAssessmentResult:
    """Analyze a job listing for scam risk indicators."""
    indicators: list[RiskIndicator] = []
    desc = (request.description or "").lower()
    title = (request.title or "").lower()
    combined = f"{title} {desc}"

    # ── Payment request signals ──────────────────────────────────
    for phrase in _PAYMENT_PHRASES:
        if phrase in combined:
            indicators.append(RiskIndicator(
                type="payment_request",
                signal=f'Listing contains payment-related phrase: "{phrase}"',
                confidence=0.85,
            ))

    # ── Urgency/pressure signals ─────────────────────────────────
    for phrase in _URGENCY_PHRASES:
        if phrase in combined:
            indicators.append(RiskIndicator(
                type="urgency_pressure",
                signal=f'High-pressure language detected: "{phrase}"',
                confidence=0.65,
            ))

    # ── Impersonation / too-good-to-be-true ──────────────────────
    for phrase in _IMPERSONATION_SIGNALS:
        if phrase in combined:
            indicators.append(RiskIndicator(
                type="impersonation",
                signal=f'Suspicious promise detected: "{phrase}"',
                confidence=0.75,
            ))

    # ── Vague description ────────────────────────────────────────
    if len(request.description or "") < 80:
        indicators.append(RiskIndicator(
            type="vague_description",
            signal="Job description is unusually short (< 80 characters)",
            confidence=0.45,
        ))

    # ── Unrealistic salary ───────────────────────────────────────
    if (
        request.salary_min is not None
        and request.salary_max is not None
        and request.salary_max > 0
        and request.salary_max > request.salary_min * 10
    ):
        indicators.append(RiskIndicator(
            type="unrealistic_salary",
            signal="Salary range is implausibly wide (max > 10× min)",
            confidence=0.60,
        ))

    # ── Suspicious email domain ──────────────────────────────────
    email = (request.contact_email or "").lower()
    free_domains = ["gmail.com", "yahoo.com", "hotmail.com", "outlook.com"]
    if email and any(email.endswith(f"@{d}") for d in free_domains):
        indicators.append(RiskIndicator(
            type="inconsistent_contact",
            signal="Contact email uses a free provider rather than a company domain",
            confidence=0.35,
        ))

    # ── Suspicious URL patterns ──────────────────────────────────
    url_pattern = re.compile(r"(bit\.ly|tinyurl|goo\.gl|t\.co|short\.)", re.IGNORECASE)
    if url_pattern.search(combined):
        indicators.append(RiskIndicator(
            type="suspicious_url",
            signal="Description contains shortened/obfuscated URLs",
            confidence=0.70,
        ))

    # ── Calculate overall risk score ─────────────────────────────
    if not indicators:
        return RiskAssessmentResult(
            indicators=[],
            risk_score=0.0,
            risk_level="low",
        )

    total_confidence = sum(i.confidence for i in indicators)
    risk_score = min(1.0, total_confidence / 3.0)

    if risk_score >= 0.7:
        risk_level = "critical"
    elif risk_score >= 0.5:
        risk_level = "high"
    elif risk_score >= 0.25:
        risk_level = "medium"
    else:
        risk_level = "low"

    return RiskAssessmentResult(
        indicators=indicators,
        risk_score=round(risk_score, 3),
        risk_level=risk_level,
    )
