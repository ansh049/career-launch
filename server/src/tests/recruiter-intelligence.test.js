process.env.JWT_SECRET = "test-jwt-secret-with-at-least-32-chars-long";
import test from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import app from "../app.js";

test("GET /api/recruiter/jobs/:jobId/candidate-matches requires recruiter authentication", async () => {
  const response = await request(app).get("/api/recruiter/jobs/64a1234567890abcdef12345/candidate-matches");
  assert.equal(response.status, 401);
  assert.equal(response.body.success, false);
});

test("POST /api/recruiter/jobs/:jobId/shortlist requires recruiter authentication and CSRF", async () => {
  const agent = request.agent(app);
  const csrfRes = await agent.get("/api/auth/csrf").expect(200);
  const csrfToken = csrfRes.body.csrfToken;

  const response = await agent
    .post("/api/recruiter/jobs/64a1234567890abcdef12345/shortlist")
    .set("X-CSRF-Token", csrfToken)
    .send({ minScore: 70 });

  assert.equal(response.status, 401);
  assert.equal(response.body.success, false);
});

test("POST /api/recruiter/candidates/:candidateId/review requires recruiter auth and CSRF", async () => {
  const agent = request.agent(app);
  const csrfRes = await agent.get("/api/auth/csrf").expect(200);
  const csrfToken = csrfRes.body.csrfToken;

  const response = await agent
    .post("/api/recruiter/candidates/64a1234567890abcdef12345/review")
    .set("X-CSRF-Token", csrfToken)
    .send({
      jobId: "64a1234567890abcdef12345",
      decision: "shortlisted",
      rating: 5,
      notes: "Strong candidate fit.",
    });

  assert.equal(response.status, 401);
  assert.equal(response.body.success, false);
});

test("POST /api/recruiter/jobs/:jobId/interview-kit requires recruiter authentication", async () => {
  const agent = request.agent(app);
  const csrfRes = await agent.get("/api/auth/csrf").expect(200);
  const csrfToken = csrfRes.body.csrfToken;

  const response = await agent
    .post("/api/recruiter/jobs/64a1234567890abcdef12345/interview-kit")
    .set("X-CSRF-Token", csrfToken)
    .send({ experienceLevel: "Senior" });

  assert.equal(response.status, 401);
  assert.equal(response.body.success, false);
});
