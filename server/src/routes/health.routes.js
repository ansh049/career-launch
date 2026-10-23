import { Router } from "express";
import mongoose from "mongoose";

const router = Router();

const MONGO_STATES = {
  0: "disconnected",
  1: "connected",
  2: "connecting",
  3: "disconnecting",
};

/**
 * Main health check endpoint.
 */
router.get("/", (req, res) => {
  const mongoState = MONGO_STATES[mongoose.connection.readyState] || "unknown";

  res.json({
    success: true,
    message: "Career Platform API is running",
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    environment: process.env.NODE_ENV || "development",
    services: {
      database: {
        status: mongoState,
        connected: mongoose.connection.readyState === 1,
      },
    },
    requestId: req.id || null,
  });
});

/**
 * Liveness probe for container orchestrators (k8s / docker).
 */
router.get("/live", (req, res) => {
  res.status(200).json({ status: "alive", timestamp: new Date().toISOString() });
});

/**
 * Readiness probe checking essential subsystem connections.
 */
router.get("/ready", (req, res) => {
  // If in test or dev without DB, report ready; in production check DB if required
  const isMongoReady = mongoose.connection.readyState === 1;

  if (process.env.NODE_ENV === "production" && !isMongoReady) {
    return res.status(503).json({
      status: "unready",
      database: "disconnected",
      timestamp: new Date().toISOString(),
    });
  }

  res.status(200).json({
    status: "ready",
    database: MONGO_STATES[mongoose.connection.readyState] || "unknown",
    timestamp: new Date().toISOString(),
  });
});

export default router;