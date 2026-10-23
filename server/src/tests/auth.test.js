import test from "node:test";
import assert from "node:assert/strict";
import {
  createAccessToken,
  createRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
} from "../utils/token.js";

test("access and refresh JWTs contain the user ID and token type", () => {
  process.env.ACCESS_TOKEN_SECRET =
    "access_test_secret_that_is_at_least_32_chars";
  process.env.REFRESH_TOKEN_SECRET =
    "refresh_test_secret_that_is_at_least_32_chars";
  const user = { _id: "507f1f77bcf86cd799439011" };

  const accessPayload = verifyAccessToken(createAccessToken(user));
  const refreshPayload = verifyRefreshToken(createRefreshToken(user));

  assert.equal(accessPayload.sub, user._id);
  assert.equal(accessPayload.type, "access");
  assert.equal(refreshPayload.sub, user._id);
  assert.equal(refreshPayload.type, "refresh");
});
