import { randomUUID } from "node:crypto";

/**
 * Assigns a unique request ID to each incoming HTTP request.
 * Sets `req.id` and the `X-Request-Id` response header for tracing and correlation.
 */
export function requestId(req, res, next) {
  const incoming = req.headers["x-request-id"];
  const id =
    typeof incoming === "string" && /^[a-zA-Z0-9_-]{1,64}$/.test(incoming)
      ? incoming
      : randomUUID();

  req.id = id;
  res.setHeader("X-Request-Id", id);
  next();
}
