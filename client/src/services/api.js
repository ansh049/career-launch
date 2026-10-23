import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const api = axios.create({
  baseURL,
  withCredentials: true,
});

let csrfToken;
let csrfTokenRequest;

function readCsrfCookie() {
  if (typeof document === "undefined") return "";
  const entry = document.cookie
    .split("; ")
    .find((cookie) => cookie.startsWith("csrfToken="));
  return entry ? decodeURIComponent(entry.slice("csrfToken=".length)) : "";
}

export function resetCsrfToken() {
  csrfToken = undefined;
  csrfTokenRequest = undefined;
}

function requestCsrfToken(forceRefresh = false) {
  if (forceRefresh) csrfToken = undefined;

  if (!csrfTokenRequest) {
    csrfTokenRequest = api
      .get("/api/auth/csrf")
      .then(({ data }) => {
        if (typeof data.csrfToken !== "string" || !data.csrfToken) {
          throw new Error("The CSRF token response was invalid.");
        }

        csrfToken = data.csrfToken;
        return csrfToken;
      })
      .finally(() => {
        csrfTokenRequest = undefined;
      });
  }

  return csrfTokenRequest;
}

api.interceptors.request.use(async (config) => {
  if (typeof FormData !== "undefined" && config.data instanceof FormData) {
    config.headers.setContentType(false);
  }

  const method = (config.method || "get").toUpperCase();
  if (["GET", "HEAD", "OPTIONS"].includes(method)) return config;

  csrfToken ||= readCsrfCookie();
  if (!csrfToken) {
    csrfToken = await requestCsrfToken();
  }

  config.headers["X-CSRF-Token"] = csrfToken;
  return config;
});

let refreshPromise = null;

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;
    const url = originalRequest?.url || "";
    const isCsrfRejection =
      status === 403 &&
      error.response?.data?.message === "Invalid or missing CSRF token";

    if (
      isCsrfRejection &&
      originalRequest &&
      !originalRequest._csrfRetry
    ) {
      originalRequest._csrfRetry = true;

      try {
        await requestCsrfToken(true);
        return api(originalRequest);
      } catch (csrfError) {
        return Promise.reject(csrfError);
      }
    }

    const isAuthEndpoint =
      url.includes("/api/auth/login") ||
      url.includes("/api/auth/register") ||
      url.includes("/api/auth/refresh") ||
      url.includes("/api/auth/logout");

    if (
      status !== 401 ||
      !originalRequest ||
      originalRequest._retry ||
      isAuthEndpoint
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      if (!refreshPromise) {
        refreshPromise = api
          .post("/api/auth/refresh", {})
          .finally(() => {
            refreshPromise = null;
          });
      }

      await refreshPromise;

      return api(originalRequest);
    } catch (refreshError) {
      return Promise.reject(refreshError);
    }
  }
);

export default api;
