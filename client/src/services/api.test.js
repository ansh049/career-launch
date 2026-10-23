import { afterEach, describe, expect, it } from "vitest";
import { AxiosError } from "axios";
import api, { resetCsrfToken } from "./api";

describe("API CSRF handling", () => {
  const originalAdapter = api.defaults.adapter;

  afterEach(() => {
    api.defaults.adapter = originalAdapter;
    resetCsrfToken();
    document.cookie = "csrfToken=; Max-Age=0; path=/";
  });

  it("refreshes a stale token once and retries the login request", async () => {
    const freshToken = "fresh-csrf-token";
    const sentTokens = [];
    let csrfRequests = 0;
    let loginRequests = 0;

    document.cookie = "csrfToken=stale-csrf-token; path=/";

    api.defaults.adapter = async (config) => {
      if (config.url === "/api/auth/csrf") {
        csrfRequests += 1;
        document.cookie = `csrfToken=${freshToken}; path=/`;
        return {
          config,
          data: { success: true, csrfToken: freshToken },
          headers: {},
          status: 200,
          statusText: "OK",
        };
      }

      loginRequests += 1;
      sentTokens.push(config.headers.get("X-CSRF-Token"));

      if (loginRequests === 1) {
        const response = {
          config,
          data: { success: false, message: "Invalid or missing CSRF token" },
          headers: {},
          status: 403,
          statusText: "Forbidden",
        };
        throw new AxiosError(
          "Request failed with status code 403",
          AxiosError.ERR_BAD_REQUEST,
          config,
          undefined,
          response,
        );
      }

      return {
        config,
        data: { success: true },
        headers: {},
        status: 200,
        statusText: "OK",
      };
    };

    await expect(api.post("/api/auth/login", {})).resolves.toMatchObject({
      data: { success: true },
    });

    expect(csrfRequests).toBe(1);
    expect(loginRequests).toBe(2);
    expect(sentTokens).toEqual(["stale-csrf-token", freshToken]);
  });

  it("preserves multipart form data for file uploads", async () => {
    const token = "test-csrf-token";
    let uploadRequest;
    document.cookie = `csrfToken=${token}; path=/`;

    api.defaults.adapter = async (config) => {
      if (config.url === "/api/auth/csrf") {
        return {
          config,
          data: { success: true, csrfToken: token },
          headers: {},
          status: 200,
          statusText: "OK",
        };
      }

      uploadRequest = config;
      return {
        config,
        data: { success: true },
        headers: {},
        status: 201,
        statusText: "Created",
      };
    };

    const form = new FormData();
    form.append("resume", new Blob(["%PDF-1.4 test"]), "resume.pdf");
    form.append("coverLetter", "Interested in the role.");

    await api.post("/api/jobs/job-1/applications", form);

    expect(uploadRequest.data).toBeInstanceOf(FormData);
    expect(uploadRequest.data.get("resume")).toBeInstanceOf(File);
    expect(uploadRequest.data.get("coverLetter")).toBe(
      "Interested in the role.",
    );
    expect(uploadRequest.headers.toJSON()).not.toHaveProperty("Content-Type");
    expect(uploadRequest.headers.get("X-CSRF-Token")).toBe(token);
  });

  it("continues sending JSON request bodies with the JSON content type", async () => {
    document.cookie = "csrfToken=test-csrf-token; path=/";
    let jsonRequest;

    api.defaults.adapter = async (config) => {
      jsonRequest = config;
      return {
        config,
        data: { success: true },
        headers: {},
        status: 200,
        statusText: "OK",
      };
    };

    await api.patch("/api/jobs/job-1", { title: "Frontend Engineer" });

    expect(jsonRequest.data).toBe('{"title":"Frontend Engineer"}');
    expect(jsonRequest.headers.get("Content-Type")).toContain(
      "application/json",
    );
  });
});
