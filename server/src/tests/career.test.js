process.env.JWT_SECRET = "test-jwt-secret-with-at-least-32-chars-long";
import test from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import app from "../app.js";

test("POST /api/career/gap-analysis requires candidate authentication", async () => {
  const agent = request.agent(app);
  const csrfRes = await agent.get("/api/auth/csrf").expect(200);
  const csrfToken = csrfRes.body.csrfToken;

  const response = await agent
    .post("/api/career/gap-analysis")
    .set("X-CSRF-Token", csrfToken)
    .send({
      targetRole: "Full Stack Engineer",
    });

  assert.equal(response.status, 401);
  assert.equal(response.body.success, false);
});

test("POST /api/career/roadmaps requires candidate authentication and CSRF", async () => {
  const agent = request.agent(app);
  const csrfRes = await agent.get("/api/auth/csrf").expect(200);
  const csrfToken = csrfRes.body.csrfToken;

  const response = await agent
    .post("/api/career/roadmaps")
    .set("X-CSRF-Token", csrfToken)
    .send({
      targetRole: "Frontend Developer",
    });

  assert.equal(response.status, 401);
  assert.equal(response.body.success, false);
});

test("GET /api/career/roadmaps requires candidate authentication", async () => {
  const response = await request(app).get("/api/career/roadmaps");
  assert.equal(response.status, 401);
  assert.equal(response.body.success, false);
});

test("PATCH /api/career/roadmaps/:id/milestones/:milestoneId requires candidate authentication", async () => {
  const agent = request.agent(app);
  const csrfRes = await agent.get("/api/auth/csrf").expect(200);
  const csrfToken = csrfRes.body.csrfToken;

  const response = await agent
    .patch("/api/career/roadmaps/64a1234567890abcdef12345/milestones/m-1")
    .set("X-CSRF-Token", csrfToken)
    .send({
      status: "completed",
    });

  assert.equal(response.status, 401);
  assert.equal(response.body.success, false);
});
