import re

SKILL_CATEGORIES = {
    "languages": {
        "python", "javascript", "typescript", "java", "c++", "c#", "c",
        "go", "rust", "ruby", "php", "swift", "kotlin", "scala", "r", "sql",
        "html", "css"
    },
    "frameworks": {
        "react", "node.js", "express", "next.js", "vue.js", "angular",
        "fastapi", "flask", "django", "spring boot", "redux",
        "tailwind css", "bootstrap", "graphql", "rest api"
    },
    "databases": {
        "mongodb", "postgresql", "mysql", "redis", "sqlite",
        "cassandra", "dynamodb", "elasticsearch", "prisma"
    },
    "cloud_and_devops": {
        "aws", "azure", "gcp", "docker", "kubernetes", "git",
        "github", "gitlab", "ci/cd", "terraform", "linux", "nginx"
    },
    "ai_and_data": {
        "machine learning", "deep learning", "pytorch", "tensorflow",
        "scikit-learn", "pandas", "numpy", "langchain", "generative ai",
        "nlp", "computer vision", "llm"
    }
}

SKILL_TERMS = {skill for cat in SKILL_CATEGORIES.values() for skill in cat}


def extract_skills(text: str) -> list[str]:
    if not text:
        return []

    normalized = text.lower()
    found = []

    for skill in sorted(SKILL_TERMS):
        # Handle c++, c# and general word boundaries
        if skill in {"c++", "c#"}:
            pattern = r"(?<!\w)" + re.escape(skill) + r"(?!\w)"
        else:
            pattern = r"(?<![a-zA-Z0-9_])" + re.escape(skill) + r"(?![a-zA-Z0-9_])"

        if re.search(pattern, normalized):
            found.append(skill)

    return found


def categorize_skills(skills: list[str]) -> dict[str, list[str]]:
    categorized: dict[str, list[str]] = {cat: [] for cat in SKILL_CATEGORIES}
    categorized["other"] = []

    skills_set = set(skills)
    for cat, terms in SKILL_CATEGORIES.items():
        matched = sorted(skills_set & terms)
        if matched:
            categorized[cat] = matched
            skills_set -= terms

    if skills_set:
        categorized["other"] = sorted(skills_set)
    else:
        del categorized["other"]

    return categorized