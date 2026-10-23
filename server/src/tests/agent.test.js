process.env.JWT_SECRET = "test-jwt-secret-with-at-least-32-chars-long";
import test from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import app from "../app.js";

test("POST /api/agent/sessions requires candidate authentication and CSRF", async () => {
  const agent = request.agent(app);
  const csrfRes = await agent.get("/api/auth/csrf").expect(200);
  const csrfToken = csrfRes.body.csrfToken;

  const response = await agent
    .post("/api/agent/sessions")
    .set("X-CSRF-Token", csrfToken)
    .send({ goal: "Find full stack engineering jobs" });

  assert.equal(response.status, 401);
  assert.equal(response.body.success, false);
});

test("GET /api/agent/sessions requires candidate authentication", async () => {
  const response = await request(app).get("/api/agent/sessions");
  assert.equal(response.status, 401);
  assert.equal(response.body.success, false);
});

test("GET /api/agent/sessions/:id requires candidate authentication", async () => {
  const response = await request(app).get("/api/agent/sessions/64a1234567890abcdef12345");
  assert.equal(response.status, 401);
  assert.equal(response.body.success, false);
});

test("POST /api/agent/sessions/:id/run requires candidate authentication and CSRF", async () => {
  const agent = request.agent(app);
  const csrfRes = await agent.get("/api/auth/csrf").expect(200);
  const csrfToken = csrfRes.body.csrfToken;

  const response = await agent
    .post("/api/agent/sessions/64a1234567890abcdef12345/run")
    .set("X-CSRF-Token", csrfToken);

  assert.equal(response.status, 401);
  assert.equal(response.body.success, false);
});

test("GET /api/agent/approvals requires candidate authentication", async () => {
  const response = await request(app).get("/api/agent/approvals");
  assert.equal(response.status, 401);
  assert.equal(response.body.success, false);
});

test("POST /api/agent/approvals/:id/decision requires candidate authentication and CSRF", async () => {
  const agent = request.agent(app);
  const csrfRes = await agent.get("/api/auth/csrf").expect(200);
  const csrfToken = csrfRes.body.csrfToken;

  const response = await agent
    .post("/api/agent/approvals/64a1234567890abcdef12345/decision")
    .set("X-CSRF-Token", csrfToken)
    .send({ decision: "approved" });

  assert.equal(response.status, 401);
  assert.equal(response.body.success, false);
});
