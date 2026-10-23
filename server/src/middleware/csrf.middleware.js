import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

const safeMethods = new Set(["GET", "HEAD", "OPTIONS"]);

function csrfSecret() {
  const secret = process.env.CSRF_SECRET || process.env.JWT_SECRET;
  if (!secret) throw new Error("CSRF_SECRET or JWT_SECRET must be configured");
  return secret;
}

function signature(nonce) {
  return createHmac("sha256", csrfSecret()).update(nonce).digest("base64url");
}

export function createCsrfToken() {
  const nonce = randomBytes(32).toString("base64url");
  return `${nonce}.${signature(nonce)}`;
}

function isValidToken(token) {
  if (!token) return false;
  const [nonce, suppliedSignature, ...extra] = token.split(".");
  if (!nonce || !suppliedSignature || extra.length) return false;

  const expectedSignature = Buffer.from(signature(nonce));
  const actualSignature = Buffer.from(suppliedSignature);
  return (
    expectedSignature.length === actualSignature.length &&
    timingSafeEqual(expectedSignature, actualSignature)
  );
}

export function csrfProtection(req, res, next) {
  if (safeMethods.has(req.method) || !req.path.startsWith("/api/")) {
    return next();
  }

  // In cross-origin deployments (e.g. client & server on separate
  // *.onrender.com subdomains), JavaScript on the client domain CANNOT read
  // cookies set on the server domain. We therefore validate only the
  // X-CSRF-Token header whose value comes from the CSRF endpoint JSON body.
  // An attacker on a third-party site cannot read that JSON response because
  // CORS blocks cross-origin reads, so the token remains unguessable.
  const headerToken = req.get("X-CSRF-Token");

  if (!headerToken || !isValidToken(headerToken)) {
    return res.status(403).json({
      success: false,
      message: "Invalid or missing CSRF token",
    });
  }

  next();
}
