const defaultLocalOrigins = [
  "http://localhost:5173",
  "http://localhost:8080",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:8080",
];

function normalizeOrigin(origin) {
  return origin ? origin.trim().replace(/\/+$/, "") : "";
}

export function getAllowedClientOrigins() {
  const configured = (process.env.CLIENT_URL || "")
    .split(",")
    .map(normalizeOrigin)
    .filter(Boolean);

  return new Set([...defaultLocalOrigins, ...configured]);
}

export function isAllowedClientOrigin(origin) {
  if (!origin) return false;
  const normalized = normalizeOrigin(origin);
  return getAllowedClientOrigins().has(normalized);
}
