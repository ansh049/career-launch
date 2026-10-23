const isProduction = process.env.NODE_ENV === "production";

const baseCookieOptions = {
  httpOnly: true,
  secure: isProduction,
  // SameSite=None is required for cross-origin cookies (e.g. client & server
  // on separate *.onrender.com subdomains). SameSite=None must be paired with
  // Secure=true, which is enforced above in production.
  sameSite: isProduction ? "none" : "lax",
};

export const ACCESS_COOKIE = "cl_access";
export const REFRESH_COOKIE = "cl_refresh";

export function setAuthCookies(res, accessToken, refreshToken) {
  res.cookie(ACCESS_COOKIE, accessToken, {
    ...baseCookieOptions,
    path: "/",
    maxAge: 15 * 60 * 1000,
  });

  res.cookie(REFRESH_COOKIE, refreshToken, {
    ...baseCookieOptions,
    path: "/api/auth",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

export function clearAuthCookies(res) {
  res.clearCookie(ACCESS_COOKIE, {
    ...baseCookieOptions,
    path: "/",
  });

  res.clearCookie(REFRESH_COOKIE, {
    ...baseCookieOptions,
    path: "/api/auth",
  });
}