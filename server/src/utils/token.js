import jwt from "jsonwebtoken";
import crypto from "node:crypto";

function getSecret(name) {
  const secret = process.env[name];

  if (!secret || secret.length < 32) {
    throw new Error(`${name} must be configured with a strong secret`);
  }

  return secret;
}

export function createAccessToken(user) {
  return jwt.sign(
    {
      sub: user._id.toString(),
      type: "access",
    },
    getSecret("ACCESS_TOKEN_SECRET"),
    {
      expiresIn: process.env.ACCESS_TOKEN_TTL || "15m",
      issuer: "careerlaunch-api",
      audience: "careerlaunch-client",
    }
  );
}

export function createRefreshToken(user) {
  return jwt.sign(
    {
      sub: user._id.toString(),
      type: "refresh",
    },
    getSecret("REFRESH_TOKEN_SECRET"),
    {
      expiresIn: process.env.REFRESH_TOKEN_TTL || "7d",
      issuer: "careerlaunch-api",
      audience: "careerlaunch-client",
      jwtid: crypto.randomUUID(),
    }
  );
}

export function verifyAccessToken(token) {
  return jwt.verify(token, getSecret("ACCESS_TOKEN_SECRET"), {
    issuer: "careerlaunch-api",
    audience: "careerlaunch-client",
  });
}

export function verifyRefreshToken(token) {
  return jwt.verify(token, getSecret("REFRESH_TOKEN_SECRET"), {
    issuer: "careerlaunch-api",
    audience: "careerlaunch-client",
  });
}

export function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function tokenHashesMatch(first, second) {
  if (!first || !second) return false;

  const firstBuffer = Buffer.from(first, "hex");
  const secondBuffer = Buffer.from(second, "hex");

  if (
    firstBuffer.length !== 32 ||
    secondBuffer.length !== 32
  ) {
    return false;
  }

  return crypto.timingSafeEqual(firstBuffer, secondBuffer);
}