process.env.JWT_SECRET = "test-jwt-secret-with-at-least-32-chars-long";
import test from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import app from "../app.js";

test("POST /api/interviews/sessions requires candidate authentication and CSRF", async () => {
  const agent = request.agent(app);
  const csrfRes = await agent.get("/api/auth/csrf").expect(200);
  const csrfToken = csrfRes.body.csrfToken;

  const response = await agent
    .post("/api/interviews/sessions")
    .set("X-CSRF-Token", csrfToken)
    .send({ role: "Frontend Developer" });

  assert.equal(response.status, 401);
  assert.equal(response.body.success, false);
});

test("GET /api/interviews/history requires candidate authentication", async () => {
  const response = await request(app).get("/api/interviews/history");
  assert.equal(response.status, 401);
  assert.equal(response.body.success, false);
});

test("GET /api/interviews/sessions/:id requires candidate authentication", async () => {
  const response = await request(app).get("/api/interviews/sessions/64a1234567890abcdef12345");
  assert.equal(response.status, 401);
  assert.equal(response.body.success, false);
});

test("POST /api/interviews/sessions/:id/answers requires candidate authentication and CSRF", async () => {
  const agent = request.agent(app);
  const csrfRes = await agent.get("/api/auth/csrf").expect(200);
  const csrfToken = csrfRes.body.csrfToken;

  const response = await agent
    .post("/api/interviews/sessions/64a1234567890abcdef12345/answers")
    .set("X-CSRF-Token", csrfToken)
    .send({
      questionId: "q-1",
      answer: "I used React and memoized expensive functions with useCallback.",
    });

  assert.equal(response.status, 401);
  assert.equal(response.body.success, false);
});

test("POST /api/interviews/sessions/:id/finish requires candidate authentication and CSRF", async () => {
  const agent = request.agent(app);
  const csrfRes = await agent.get("/api/auth/csrf").expect(200);
  const csrfToken = csrfRes.body.csrfToken;

  const response = await agent
    .post("/api/interviews/sessions/64a1234567890abcdef12345/finish")
    .set("X-CSRF-Token", csrfToken);

  assert.equal(response.status, 401);
  assert.equal(response.body.success, false);
});
