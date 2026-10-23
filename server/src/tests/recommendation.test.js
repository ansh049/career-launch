process.env.JWT_SECRET = "test-jwt-secret-with-at-least-32-chars-long";
import test from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import app from "../app.js";

test("GET /api/recommendations/me requires candidate authentication", async () => {
  const response = await request(app).get("/api/recommendations/me");
  assert.equal(response.status, 401);
  assert.equal(response.body.success, false);
});

test("POST /api/recommendations/explain requires candidate authentication", async () => {
  const agent = request.agent(app);
  const csrfRes = await agent.get("/api/auth/csrf").expect(200);
  const csrfToken = csrfRes.body.csrfToken;

  const response = await agent
    .post("/api/recommendations/explain")
    .set("X-CSRF-Token", csrfToken)
    .send({
      title: "Backend Engineer",
      company: "Tech Corp",
      matched_skills: ["node.js"],
      missing_skills: ["redis"],
      similarity_score: 85,
    });

  assert.equal(response.status, 401);
  assert.equal(response.body.success, false);
});

test("GET /api/recommendations/explanations/:jobId requires candidate authentication", async () => {
  const response = await request(app).get("/api/recommendations/explanations/64a1234567890abcdef12345");
  assert.equal(response.status, 401);
  assert.equal(response.body.success, false);
});

test("POST /api/recommendations/feedback requires candidate authentication and CSRF", async () => {
  const agent = request.agent(app);
  const csrfRes = await agent.get("/api/auth/csrf").expect(200);
  const csrfToken = csrfRes.body.csrfToken;

  const response = await agent
    .post("/api/recommendations/feedback")
    .set("X-CSRF-Token", csrfToken)
    .send({
      jobId: "64a1234567890abcdef12345",
      feedback: "helpful",
      scoringVersion: "v2.0",
    });

  assert.equal(response.status, 401);
  assert.equal(response.body.success, false);
});

test("GET /api/recommendations/history requires candidate authentication", async () => {
  const response = await request(app).get("/api/recommendations/history");
  assert.equal(response.status, 401);
  assert.equal(response.body.success, false);
});
