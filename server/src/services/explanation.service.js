export async function explainMatch(match) {
  const response = await fetch(
    `${process.env.AI_SERVICE_URL}/internal/explain-match`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Internal-Token": process.env.AI_INTERNAL_TOKEN
      },
      body: JSON.stringify({
        job_title: match.title,
        company: match.company,
        matched_skills: match.matched_skills,
        missing_skills: match.missing_skills,
        similarity_score: match.similarity_score
      }),
      signal: AbortSignal.timeout(30_000)
    }
  );

  if (!response.ok) {
    throw new Error("AI explanation service unavailable");
  }

  return response.json();
}