process.env.JWT_SECRET = "test-jwt-secret-with-at-least-32-chars-long";
import test from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import app from "../app.js";

test("POST /api/resume-copilot/sessions requires candidate authentication", async () => {
  const agent = request.agent(app);
  const csrfRes = await agent.get("/api/auth/csrf").expect(200);
  const csrfToken = csrfRes.body.csrfToken;

  const response = await agent
    .post("/api/resume-copilot/sessions")
    .set("X-CSRF-Token", csrfToken)
    .send({ jobId: "64a1234567890abcdef12345" });

  assert.equal(response.status, 401);
  assert.equal(response.body.success, false);
});

test("GET /api/resume-copilot/sessions requires candidate authentication", async () => {
  const response = await request(app).get("/api/resume-copilot/sessions");
  assert.equal(response.status, 401);
  assert.equal(response.body.success, false);
});

test("GET /api/applications/:id/timeline requires authentication", async () => {
  const response = await request(app).get("/api/applications/64a1234567890abcdef12345/timeline");
  assert.equal(response.status, 401);
  assert.equal(response.body.success, false);
});

test("POST /api/applications/:id/reminders requires candidate authentication and CSRF", async () => {
  const agent = request.agent(app);
  const csrfRes = await agent.get("/api/auth/csrf").expect(200);
  const csrfToken = csrfRes.body.csrfToken;

  const response = await agent
    .post("/api/applications/64a1234567890abcdef12345/reminders")
    .set("X-CSRF-Token", csrfToken)
    .send({
      title: "Follow up with recruiter",
      dueAt: new Date().toISOString(),
      type: "follow_up",
    });

  assert.equal(response.status, 401);
  assert.equal(response.body.success, false);
});

test("GET /api/reminders/upcoming requires authentication", async () => {
  const response = await request(app).get("/api/reminders/upcoming");
  assert.equal(response.status, 401);
  assert.equal(response.body.success, false);
});
