import test from "node:test";
import assert from "node:assert/strict";
import { readFile, rm } from "node:fs/promises";
import mongoose from "mongoose";
import request from "supertest";
import { fileURLToPath } from "node:url";
import User from "../models/User.js";
import Job from "../models/Job.js";
import Application from "../models/Application.js";

const testDatabaseUri = process.env.TEST_MONGODB_URI;

test(
  "candidate registration can proceed through resume application submission",
  {
    skip: !testDatabaseUri,
  },
  async () => {
    const databaseName = new URL(testDatabaseUri).pathname
      .replace(/^\/+/, "")
      .split("/")[0];
    if (!databaseName || !/(?:^|[-_])test(?:$|[-_])/i.test(databaseName)) {
      throw new Error(
        "TEST_MONGODB_URI must point to a dedicated test database",
      );
    }

    const previousEnv = {
      NODE_ENV: process.env.NODE_ENV,
      JWT_SECRET: process.env.JWT_SECRET,
      ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET,
      REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET,
      TEST_MONGODB_URI: process.env.TEST_MONGODB_URI,
    };
    let uploadedResumePath;
    let connected = false;

    try {
      process.env.NODE_ENV = "test";
      process.env.JWT_SECRET = "integration-test-secret-with-sufficient-length";
      process.env.ACCESS_TOKEN_SECRET =
        "integration-access-secret-with-sufficient-length";
      process.env.REFRESH_TOKEN_SECRET =
        "integration-refresh-secret-with-sufficient-length";

      const { default: app } = await import("../app.js");
      await mongoose.connect(testDatabaseUri);
      connected = true;
      await mongoose.connection.dropDatabase();

      const agent = request.agent(app);
      const csrfResponse = await agent.get("/api/auth/csrf").expect(200);
      const csrfToken = csrfResponse.body.csrfToken;
      const registration = await agent
        .post("/api/auth/register")
        .set("X-CSRF-Token", csrfToken)
        .send({
          name: "Test Candidate",
          email: `candidate-${Date.now()}@example.test`,
          password: "integration-password-123",
          role: "candidate",
        })
        .expect(201);

      const recruiter = await User.create({
        name: "Test Recruiter",
        email: `recruiter-${Date.now()}@example.test`,
        passwordHash: "unused-in-test",
        role: "recruiter",
        recruiterVerified: true,
      });
      const job = await Job.create({
        title: "Frontend Engineer",
        company: "Test Company",
        description:
          "Build user interfaces for the Career Platform test suite.",
        skills: ["javascript", "react"],
        jobType: "full-time",
        createdBy: recruiter._id,
        status: "published",
      });

      const testPdf = Buffer.from(
        "%PDF-1.4\nIsolated integration test resume\n%%EOF",
      );
      const applicationResponse = await agent
        .post(`/api/jobs/${job._id}/applications`)
        .set("X-CSRF-Token", csrfToken)
        .field("coverLetter", "I am interested in this position.")
        .attach("resume", testPdf, {
          filename: "isolated-test-resume.pdf",
          contentType: "application/pdf",
        })
        .expect(201);

      assert.equal(applicationResponse.body.success, true);
      assert.equal(
        applicationResponse.body.message,
        "Application submitted successfully.",
      );
      assert.ok(applicationResponse.body.application._id);
      assert.equal(applicationResponse.body.application.status, "submitted");

      const myApplications = await agent
        .get("/api/applications/mine?page=1&limit=50")
        .expect(200);

      const applications = await Application.find({
        candidate: registration.body.user.id,
      });
      const savedApplication = await Application.findById(
        applicationResponse.body.application._id,
      ).select("+resume.storageKey");
      uploadedResumePath = fileURLToPath(
        new URL(
          `../../private_uploads/${savedApplication.resume.storageKey}`,
          import.meta.url,
        ),
      );
      const storedPdf = await readFile(uploadedResumePath);

      assert.equal(applications.length, 1);
      assert.equal(myApplications.body.success, true);
      assert.equal(myApplications.body.applications.length, 1);
      assert.equal(
        myApplications.body.applications[0]._id,
        applicationResponse.body.application._id,
      );
      assert.equal(
        String(applications[0]._id),
        applicationResponse.body.application._id,
      );
      assert.deepEqual(storedPdf, testPdf);
    } finally {
      if (uploadedResumePath) await rm(uploadedResumePath, { force: true });
      if (connected) {
        await mongoose.connection.dropDatabase();
        await mongoose.disconnect();
      }
      for (const [key, value] of Object.entries(previousEnv)) {
        if (value === undefined) delete process.env[key];
        else process.env[key] = value;
      }
    }
  },
);
