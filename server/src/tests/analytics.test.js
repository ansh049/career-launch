process.env.JWT_SECRET = "test-jwt-secret-with-at-least-32-chars-long";
import test from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import app from "../app.js";

test("GET /api/analytics/candidate requires candidate authentication", async () => {
  const response = await request(app).get("/api/analytics/candidate");
  assert.equal(response.status, 401);
  assert.equal(response.body.success, false);
});

test("GET /api/analytics/recruiter requires recruiter authentication", async () => {
  const response = await request(app).get("/api/analytics/recruiter");
  assert.equal(response.status, 401);
  assert.equal(response.body.success, false);
});

test("GET /api/analytics/market requires authentication", async () => {
  const response = await request(app).get("/api/analytics/market");
  assert.equal(response.status, 401);
  assert.equal(response.body.success, false);
});

test("GET /api/market/skills/:skillId/related requires authentication", async () => {
  const response = await request(app).get("/api/market/skills/123/related");
  assert.equal(response.status, 401);
  assert.equal(response.body.success, false);
});
