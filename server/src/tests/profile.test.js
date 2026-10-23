process.env.JWT_SECRET = "test-jwt-secret-with-at-least-32-chars-long";
import test from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import app from "../app.js";

test("GET /api/profile/me requires candidate authentication", async () => {
  const response = await request(app).get("/api/profile/me");
  assert.equal(response.status, 401);
  assert.equal(response.body.success, false);
});

test("POST /api/profile/parse-resume requires candidate authentication with valid CSRF", async () => {
  const agent = request.agent(app);
  const csrfRes = await agent.get("/api/auth/csrf").expect(200);
  const csrfToken = csrfRes.body.csrfToken;

  const response = await agent
    .post("/api/profile/parse-resume")
    .set("X-CSRF-Token", csrfToken);

  assert.equal(response.status, 401);
  assert.equal(response.body.success, false);
});

test("PUT /api/profile/me requires candidate authentication with valid CSRF", async () => {
  const agent = request.agent(app);
  const csrfRes = await agent.get("/api/auth/csrf").expect(200);
  const csrfToken = csrfRes.body.csrfToken;

  const response = await agent
    .put("/api/profile/me")
    .set("X-CSRF-Token", csrfToken)
    .send({
      headline: "Full Stack Engineer",
    });

  assert.equal(response.status, 401);
  assert.equal(response.body.success, false);
});
