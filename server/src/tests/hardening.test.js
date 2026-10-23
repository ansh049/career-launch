process.env.JWT_SECRET = "test-jwt-secret-with-at-least-32-chars-long";
import test from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import app from "../app.js";

test("Helmet sets expected security headers", async () => {
  const response = await request(app).get("/api/health");

  assert.equal(response.status, 200);
  assert.equal(response.headers["x-content-type-options"], "nosniff");
  assert.ok(response.headers["strict-transport-security"]);
  assert.ok(response.headers["cross-origin-resource-policy"]);
});

test("Generates and returns X-Request-Id header", async () => {
  const response = await request(app).get("/api/health");

  assert.equal(response.status, 200);
  const requestId = response.headers["x-request-id"];
  assert.ok(requestId, "X-Request-Id header must be present");
  assert.match(
    requestId,
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    "Default request ID must be a UUID",
  );
  assert.equal(response.body.requestId, requestId);
});

test("Preserves incoming valid X-Request-Id header", async () => {
  const customId = "trace-req-client-12345";
  const response = await request(app)
    .get("/api/health")
    .set("X-Request-Id", customId);

  assert.equal(response.status, 200);
  assert.equal(response.headers["x-request-id"], customId);
  assert.equal(response.body.requestId, customId);
});

test("Centralized notFound returns 404 with requestId", async () => {
  const response = await request(app).get("/api/non-existent-route-xyz");

  assert.equal(response.status, 404);
  assert.equal(response.body.success, false);
  assert.match(response.body.message, /Route not found/);
  assert.ok(response.body.requestId);
  assert.equal(response.headers["x-request-id"], response.body.requestId);
});

test("Health check probes (/live and /ready) respond properly", async () => {
  const liveRes = await request(app).get("/api/health/live");
  assert.equal(liveRes.status, 200);
  assert.equal(liveRes.body.status, "alive");

  const readyRes = await request(app).get("/api/health/ready");
  assert.equal(readyRes.status, 200);
  assert.ok(readyRes.body.status);
});
