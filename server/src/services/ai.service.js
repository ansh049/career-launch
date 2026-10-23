export async function getResumeAnalysis(fileBuffer) {
  const form = new FormData();

  form.append(
    "file",
    new Blob([fileBuffer], { type: "application/pdf" }),
    "resume.pdf",
  );

  const response = await fetch(`${process.env.AI_SERVICE_URL}/analyze-pdf`, {
    method: "POST",
    headers: { "X-Internal-Token": process.env.AI_INTERNAL_TOKEN },
    body: form,
    signal: AbortSignal.timeout(30_000),
  });

  if (!response.ok) {
    throw new Error("Resume analysis service failed");
  }

  return response.json();
}

export async function getRecommendations(resumeText, jobs, candidateSkills = []) {
  const response = await fetch(
    `${process.env.AI_SERVICE_URL}/internal/recommend`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Internal-Token": process.env.AI_INTERNAL_TOKEN,
      },
      body: JSON.stringify({
        resume_text: resumeText,
        candidate_skills: candidateSkills,
        jobs,
      }),
      signal: AbortSignal.timeout(60_000),
    },
  );

  if (!response.ok) {
    throw new Error("Job matching service failed");
  }

  return response.json();
}
