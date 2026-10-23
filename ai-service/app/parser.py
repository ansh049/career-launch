import re
from typing import Any

from app.skills import extract_skills, categorize_skills, SKILL_TERMS

# Common section headers
EDUCATION_HEADERS = [
    "education", "academic background", "academics",
    "qualifications", "educational background", "academic qualifications"
]

DEGREE_PATTERNS = [
    (r"\b(?:b\.?tech(?:nology)?|b\.?e\.?|bachelor of (?:technology|engineering))\b", "Bachelor of Technology (B.Tech)"),
    (r"\b(?:b\.?s\.?c?|bachelor of science)\b", "Bachelor of Science (B.S.)"),
    (r"\b(?:b\.?c\.?a\.?|bachelor of computer applications)\b", "Bachelor of Computer Applications (B.C.A.)"),
    (r"\b(?:bachelor(?:'s)? degree|bachelor of arts|b\.?a\.?)\b", "Bachelor's Degree"),
    (r"\b(?:m\.?tech(?:nology)?|m\.?e\.?|master of (?:technology|engineering))\b", "Master of Technology (M.Tech)"),
    (r"\b(?:m\.?s\.?c?|master of science)\b", "Master of Science (M.S.)"),
    (r"\b(?:m\.?c\.?a\.?|master of computer applications)\b", "Master of Computer Applications (M.C.A.)"),
    (r"\b(?:m\.?b\.?a\.?|master of business administration)\b", "Master of Business Administration (MBA)"),
    (r"\b(?:master(?:'s)? degree)\b", "Master's Degree"),
    (r"\b(?:ph\.?d\.?|doctor of philosophy)\b", "Doctor of Philosophy (Ph.D.)"),
    (r"\b(?:associate(?:'s)? degree)\b", "Associate Degree"),
    (r"\b(?:diploma)\b", "Diploma"),
    (r"\b(?:high school|senior secondary|12th grade|12th)\b", "High School"),
]

FIELDS_OF_STUDY = [
    "Computer Science and Engineering",
    "Computer Science",
    "Information Technology",
    "Software Engineering",
    "Data Science",
    "Artificial Intelligence and Machine Learning",
    "Artificial Intelligence",
    "Machine Learning",
    "Cybersecurity",
    "Electrical and Electronics Engineering",
    "Electronics and Communication Engineering",
    "Electrical Engineering",
    "Mechanical Engineering",
    "Civil Engineering",
    "Business Administration",
    "Information Systems",
    "Mathematics and Computing",
    "Applied Mathematics",
    "Physics",
]

COMMON_INSTITUTIONS_KEYWORDS = [
    "university", "college", "institute", "school", "academy",
    "polytechnic", "iit", "nit", "bits", "iiit"
]


def extract_contact_info(text: str) -> dict[str, Any]:
    lines = [line.strip() for line in text.splitlines() if line.strip()]

    # 1. Email extraction
    email_pattern = r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b"
    email_match = re.search(email_pattern, text)
    email = email_match.group(0) if email_match else ""

    # 2. Phone extraction (international & local)
    phone = ""
    phone_pattern = r"(?:\+?\d{1,3}[-.\s]?)?\(?\d{2,4}\)?[-.\s]?\d{3,4}[-.\s]?\d{3,4}\b"
    for match in re.finditer(phone_pattern, text):
        candidate = match.group(0).strip()
        digits = re.sub(r"\D", "", candidate)
        # Avoid year ranges like 2020-2024
        if len(digits) >= 9 and not (len(digits) == 8 and digits.startswith(("19", "20"))):
            phone = candidate
            break

    # 3. Links extraction
    links: dict[str, str] = {}
    linkedin_match = re.search(
        r"(?:https?://)?(?:www\.)?linkedin\.com/(?:in|pub)/[a-zA-Z0-9_\-\./]+",
        text,
        re.IGNORECASE,
    )
    if linkedin_match:
        url = linkedin_match.group(0).rstrip(".,;")
        if not url.startswith("http"):
            url = f"https://{url}"
        links["linkedin"] = url

    github_match = re.search(
        r"(?:https?://)?(?:www\.)?github\.com/[a-zA-Z0-9_\-\./]+",
        text,
        re.IGNORECASE,
    )
    if github_match:
        url = github_match.group(0).rstrip(".,;")
        if not url.startswith("http"):
            url = f"https://{url}"
        links["github"] = url

    generic_urls = re.findall(
        r"https?://[a-zA-Z0-9.\-_]+(?:\.[a-zA-Z]{2,})(?:/[^\s]*)?",
        text,
    )
    for u in generic_urls:
        clean = u.rstrip(".,;")
        if "linkedin.com" not in clean and "github.com" not in clean:
            links["portfolio"] = clean
            break

    # 4. Name extraction from top lines
    name = ""
    header_blacklist = {
        "resume", "curriculum", "vitae", "cv", "page", "profile", "contact",
        "email", "phone", "skills", "experience", "education", "projects",
        "summary", "objective"
    }

    for line in lines[:8]:
        # Skip lines containing email, phone, or links
        if "@" in line or "http" in line or "github" in line or "linkedin" in line:
            continue
        cleaned = re.sub(r"[^a-zA-Z\s]", " ", line).strip()
        words = cleaned.split()
        if 2 <= len(words) <= 4:
            if not any(w.lower() in header_blacklist for w in words):
                # Ensure words are capitalized like names
                if all(len(w) > 1 and w[0].isupper() for w in words):
                    name = " ".join(words)
                    break

    if not name and email:
        local = email.split("@")[0]
        cleaned_local = re.sub(r"[0-9_]+", " ", local).replace(".", " ").strip()
        if len(cleaned_local.split()) >= 2:
            name = cleaned_local.title()

    # 5. Location extraction
    location = ""
    for loc_match in re.finditer(
        r"\b([A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+)?),\s*([A-Z]{2}|[A-Z][a-zA-Z]+)\b",
        text[:1200],
    ):
        cand_loc = loc_match.group(0)
        parts = [p.strip().lower() for p in cand_loc.split(",")]
        # Ensure neither part is a programming skill or heading keyword
        if not any(p in SKILL_TERMS or p in header_blacklist for p in parts):
            location = cand_loc
            break

    return {
        "name": name,
        "email": email,
        "phone": phone,
        "location": location,
        "links": links,
    }


def extract_education(text: str) -> list[dict[str, str]]:
    """
    Rule-based extraction of education entries from resume text.
    Extracts Degree, Institution, Field of Study, Graduation Year, Score.
    """
    entries: list[dict[str, str]] = []
    lines = [line.strip() for line in text.splitlines() if line.strip()]

    # Locate education section if present
    edu_lines = []
    in_edu_section = False

    for line in lines:
        lower_line = line.lower().strip(": ")
        if any(lower_line == header for header in EDUCATION_HEADERS):
            in_edu_section = True
            continue
        elif in_edu_section and any(
            lower_line.startswith(h)
            for h in ["skills", "experience", "work experience", "projects", "certifications", "achievements"]
        ):
            in_edu_section = False
            break

        if in_edu_section:
            edu_lines.append(line)

    # If no explicit section header found, search through all lines
    target_lines = edu_lines if edu_lines else lines

    # Window scanning for education clusters
    i = 0
    while i < len(target_lines):
        line = target_lines[i]
        matched_degree = None

        for pattern, degree_name in DEGREE_PATTERNS:
            if re.search(pattern, line, re.IGNORECASE):
                matched_degree = degree_name
                break

        if matched_degree:
            # Check current line + next 3 lines for context
            context_block = " \n ".join(target_lines[max(0, i - 1): min(len(target_lines), i + 4)])

            # 1. Field of Study
            field_of_study = ""
            for field in FIELDS_OF_STUDY:
                if re.search(r"\b" + re.escape(field) + r"\b", context_block, re.IGNORECASE):
                    field_of_study = field
                    break

            # 2. Institution
            institution = ""
            for ctx_line in target_lines[max(0, i - 1): min(len(target_lines), i + 4)]:
                lower_ctx = ctx_line.lower()
                if any(kw in lower_ctx for kw in COMMON_INSTITUTIONS_KEYWORDS):
                    # Clean up the line
                    institution = ctx_line.strip(" -,:|")
                    break

            # 3. Graduation Year
            graduation_year = ""
            year_range_match = re.search(
                r"\b((?:19|20)\d{2}\s*(?:-|–|to)\s*(?:(?:19|20)\d{2}|Present|Current|Expected))\b",
                context_block,
                re.IGNORECASE,
            )
            if year_range_match:
                graduation_year = year_range_match.group(1)
            else:
                single_year_match = re.search(r"\b(20\d{2})\b", context_block)
                if single_year_match:
                    graduation_year = single_year_match.group(1)

            # 4. Score / GPA
            score = ""
            score_match = re.search(
                r"\b(?:CGPA|GPA|Score|Percentage)[:\s]*([0-9]+(?:\.[0-9]+)?(?:\s*/\s*[0-9]+(?:\.[0-9]+)?)?%?)",
                context_block,
                re.IGNORECASE,
            )
            if score_match:
                score = score_match.group(0).strip()

            entry = {
                "degree": matched_degree,
                "institution": institution,
                "field_of_study": field_of_study,
                "graduation_year": graduation_year,
                "score": score,
            }

            # Avoid duplicates
            if not any(e["degree"] == entry["degree"] and e["institution"] == entry["institution"] for e in entries):
                entries.append(entry)

        i += 1

    return entries


def extract_summary(text: str) -> str:
    """Extract professional summary or objective if present."""
    lines = [line.strip() for line in text.splitlines() if line.strip()]
    summary_lines = []
    in_summary = False

    for line in lines:
        lower = line.lower().strip(": ")
        if any(lower.startswith(h) for h in ["summary", "professional summary", "about me", "objective", "career objective"]):
            in_summary = True
            continue
        elif in_summary and any(
            lower.startswith(h)
            for h in ["skills", "education", "experience", "projects", "certifications"]
        ):
            break

        if in_summary:
            summary_lines.append(line)
            if len(" ".join(summary_lines)) > 500:
                break

    return " ".join(summary_lines).strip()[:800]


def generate_headline(contact_info: dict[str, Any], skills: list[str], education: list[dict[str, str]]) -> str:
    """Generate a clean headline if none is explicitly specified."""
    top_skills = [s.title() for s in skills[:3]]
    skills_suffix = f" | {', '.join(top_skills)}" if top_skills else ""

    if education and education[0].get("degree"):
        degree_part = education[0]["degree"].split("(")[0].strip()
        field_part = f" in {education[0]['field_of_study']}" if education[0].get("field_of_study") else ""
        return f"{degree_part}{field_part}{skills_suffix}"[:120]

    if top_skills:
        return f"Software Professional specialized in {', '.join(top_skills)}"[:120]

    return "Aspiring Software Professional"


def parse_resume(text: str) -> dict[str, Any]:
    """
    Main rule-based resume parsing intelligence.
    Extracts contact information, skills (categorized), education, summary, and headline.
    """
    contact_info = extract_contact_info(text)
    skills = extract_skills(text)
    categorized_skills = categorize_skills(skills)
    education = extract_education(text)
    summary = extract_summary(text)
    headline = generate_headline(contact_info, skills, education)

    return {
        "contact_info": contact_info,
        "skills": skills,
        "skill_count": len(skills),
        "categorized_skills": categorized_skills,
        "education": education,
        "summary": summary,
        "headline": headline,
    }
