import test from "node:test";
import assert from "node:assert/strict";
import app from "../app.js";
import { createServer } from "node:http";
import request from "supertest";

test("health endpoint returns success", async () => {
  const server = createServer(app);

  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));

  try {
    const { port } = server.address();
    const response = await fetch(`http://127.0.0.1:${port}/api/health`);
    const data = await response.json();

    assert.equal(response.status, 200);
    assert.equal(data.success, true);
    assert.equal(data.message, "Career Platform API is running");

    const preflight = await fetch(
      `http://127.0.0.1:${port}/api/auth/register`,
      {
        method: "OPTIONS",
        headers: {
          Origin: "http://localhost:5173",
          "Access-Control-Request-Method": "POST",
          "Access-Control-Request-Headers": "content-type,x-csrf-token",
        },
      },
    );
    assert.equal(preflight.status, 204);
    assert.match(
      preflight.headers.get("access-control-allow-headers"),
      /x-csrf-token/i,
    );

    const csrfDenied = await fetch(`http://127.0.0.1:${port}/api/auth/logout`, {
      method: "POST",
    });
    assert.equal(csrfDenied.status, 403);
  } finally {
    await new Promise((resolve, reject) =>
      server.close((error) => (error ? reject(error) : resolve())),
    );
  }
});

test("configured deployment origin does not block local registration", async () => {
  const previousClientUrl = process.env.CLIENT_URL;
  const previousJwtSecret = process.env.JWT_SECRET;
  process.env.CLIENT_URL = "http://localhost:8080";
  process.env.JWT_SECRET = "csrf-test-secret-with-sufficient-entropy";

  try {
    const server = createServer(app);
    await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));

    try {
      const { port } = server.address();
      const preflight = await fetch(
        `http://127.0.0.1:${port}/api/auth/register`,
        {
          method: "OPTIONS",
          headers: {
            Origin: "http://localhost:5173",
            "Access-Control-Request-Method": "POST",
            "Access-Control-Request-Headers": "content-type,x-csrf-token",
          },
        },
      );

      assert.equal(preflight.status, 204);
      assert.equal(
        preflight.headers.get("access-control-allow-origin"),
        "http://localhost:5173",
      );

      const agent = request.agent(app);
      const { body } = await agent.get("/api/auth/csrf").expect(200);
      await agent
        .post("/api/auth/register")
        .set("Origin", "http://localhost:5173")
        .set("X-CSRF-Token", body.csrfToken)
        .send({})
        .expect(400);

      await agent
        .post("/api/auth/register")
        .set("Origin", "http://untrusted.example")
        .set("X-CSRF-Token", body.csrfToken)
        .send({})
        .expect(403);
    } finally {
      await new Promise((resolve, reject) =>
        server.close((error) => (error ? reject(error) : resolve())),
      );
    }
  } finally {
    if (previousClientUrl === undefined) delete process.env.CLIENT_URL;
    else process.env.CLIENT_URL = previousClientUrl;
    if (previousJwtSecret === undefined) delete process.env.JWT_SECRET;
    else process.env.JWT_SECRET = previousJwtSecret;
  }
});

test("CSRF token allows an unsafe auth request", async () => {
  const previousSecret = process.env.JWT_SECRET;
  process.env.JWT_SECRET = "csrf-test-secret-with-sufficient-entropy";

  try {
    const agent = request.agent(app);
    const { body } = await agent.get("/api/auth/csrf").expect(200);

    await agent
      .post("/api/auth/logout")
      .set("X-CSRF-Token", body.csrfToken)
      .expect(200);
  } finally {
    if (previousSecret === undefined) delete process.env.JWT_SECRET;
    else process.env.JWT_SECRET = previousSecret;
  }
});
