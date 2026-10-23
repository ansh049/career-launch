process.env.JWT_SECRET = "test-jwt-secret-with-at-least-32-chars-long";
import test from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import app from "../app.js";

test("POST /api/jobs/:jobId/report requires authentication and CSRF", async () => {
  const agent = request.agent(app);
  const csrfRes = await agent.get("/api/auth/csrf").expect(200);
  const csrfToken = csrfRes.body.csrfToken;

  const response = await agent
    .post("/api/jobs/64a1234567890abcdef12345/report")
    .set("X-CSRF-Token", csrfToken)
    .send({
      reason: "Suspicious Payment Request",
      details: "Asks for registration fees upfront.",
    });

  assert.equal(response.status, 401);
  assert.equal(response.body.success, false);
});

test("GET /api/moderation/jobs/flagged requires admin authentication", async () => {
  const response = await request(app).get("/api/moderation/jobs/flagged");
  assert.equal(response.status, 401);
  assert.equal(response.body.success, false);
});

test("POST /api/moderation/jobs/:jobId/review requires admin authentication and CSRF", async () => {
  const agent = request.agent(app);
  const csrfRes = await agent.get("/api/auth/csrf").expect(200);
  const csrfToken = csrfRes.body.csrfToken;

  const response = await agent
    .post("/api/moderation/jobs/64a1234567890abcdef12345/review")
    .set("X-CSRF-Token", csrfToken)
    .send({
      decision: "safe",
      notes: "Verified employer identity and legitimacy.",
    });

  assert.equal(response.status, 401);
  assert.equal(response.body.success, false);
});

test("GET /api/jobs/:jobId/risk-summary requires authentication", async () => {
  const response = await request(app).get("/api/jobs/000000000000000000000000/risk-summary");
  assert.equal(response.status, 401);
  assert.equal(response.body.success, false);
});
