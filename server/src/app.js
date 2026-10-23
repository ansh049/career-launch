import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { rateLimit } from "express-rate-limit";
import healthRoutes from "./routes/health.routes.js";
import { notFound, errorHandler } from "./middleware/error.middleware.js";
import { requestId } from "./middleware/requestId.middleware.js";
import authRoutes from "./routes/authRoutes.js";
import applicationRoutes from "./routes/applicationRoutes.js";
import recommendationRoutes from "./routes/recommendation.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import { csrfProtection } from "./middleware/csrf.middleware.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import { isAllowedClientOrigin } from "./config/clientOrigins.js";

import jobRoutes from "./routes/jobRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import careerRoutes from "./routes/career.routes.js";
import resumeCopilotRoutes from "./routes/resumeCopilot.routes.js";
import reminderRoutes from "./routes/reminder.routes.js";
import interviewRoutes from "./routes/interview.routes.js";
import agentRoutes from "./routes/agent.routes.js";
import moderationRoutes from "./routes/moderation.routes.js";
import analyticsRoutes from "./routes/analytics.routes.js";
import recruiterIntelligenceRoutes from "./routes/recruiterIntelligence.routes.js";
import skillGraphRoutes from "./routes/skillGraph.routes.js";
import marketRoutes from "./routes/market.routes.js";

const app = express();

// 1. Request ID tracing middleware (first in pipeline)
app.use(requestId);

// 2. Helmet Security Headers
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'", "http://localhost:*", "http://127.0.0.1:*"],
      },
    },
    crossOriginResourcePolicy: { policy: "cross-origin" },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
  })
);

// 3. CORS allow-list
app.use(
  cors({
    origin: (origin, callback) => {
      callback(null, !origin || isAllowedClientOrigin(origin));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "X-CSRF-Token", "X-Request-Id"],
    exposedHeaders: ["X-Request-Id"],
  })
);

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// 4. Rate Limiting with standardized response & test skip
const rateLimitHandler = (req, res, next, options) => {
  res.status(options.statusCode).json({
    success: false,
    message: "Too many requests. Please try again later.",
    requestId: req.id || null,
  });
};

app.use(
  "/api",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 300,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    skip: () => process.env.NODE_ENV === "test",
    handler: rateLimitHandler,
  })
);

app.use(
  "/api/auth",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 30,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    skip: () => process.env.NODE_ENV === "test",
    handler: rateLimitHandler,
  })
);

app.use(
  "/api/recommendations",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 60,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    skip: () => process.env.NODE_ENV === "test",
    handler: rateLimitHandler,
  })
);

// 5. CSRF Protection for state-modifying requests
app.use(csrfProtection);

// 6. Application Routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/recommendations", recommendationRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/career", skillGraphRoutes);
app.use("/api/career", careerRoutes);
app.use("/api/resume-copilot", resumeCopilotRoutes);
app.use("/api/reminders", reminderRoutes);
app.use("/api/interviews", interviewRoutes);
app.use("/api/agent", agentRoutes);
app.use("/api", dashboardRoutes);
app.use("/api", moderationRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/recruiter", recruiterIntelligenceRoutes);
app.use("/api/market", marketRoutes);
app.use("/market", marketRoutes);

app.get("/", (req, res) => {
  res.json({
    name: "Career Platform API",
    version: "1.0.0",
    status: "running",
    requestId: req.id || null,
  });
});

app.use("/api/health", healthRoutes);

// 7. Centralized Error Handling
app.use(notFound);
app.use(errorHandler);

export default app;
