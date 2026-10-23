/**
 * Centralized 404 Not Found handler.
 */
export function notFound(req, res) {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
    requestId: req.id || null,
  });
}

/**
 * Centralized error handling middleware.
 * Formats errors uniformly, avoids leaking sensitive stack traces in production,
 * and attaches the current request ID for traceability.
 */
export function errorHandler(error, req, res, next) {
  if (res.headersSent) return next(error);

  // Log error with requestId
  if (process.env.NODE_ENV !== "test") {
    console.error(`[Error] [${req.id || "no-request-id"}]`, error);
  }

  let status = error.statusCode || error.status || 500;
  let message = error.message || "Internal server error";
  let details = undefined;

  // Handle Mongoose Validation Errors
  if (error.name === "ValidationError" && error.errors) {
    status = 400;
    message = "Validation failed";
    details = Object.keys(error.errors).reduce((acc, key) => {
      acc[key] = error.errors[key].message;
      return acc;
    }, {});
  }

  // Handle Mongoose CastError (e.g. invalid ObjectId)
  if (error.name === "CastError") {
    status = 400;
    message = `Invalid ${error.path || "identifier"}: ${error.value}`;
  }

  // Handle MongoDB Duplicate Key (E11000)
  if (error.code === 11000) {
    status = 409;
    const fields = error.keyValue ? Object.keys(error.keyValue).join(", ") : "field";
    message = `A resource with this ${fields} already exists`;
  }

  // Handle Multer upload errors
  if (error.name === "MulterError") {
    status = error.code === "LIMIT_FILE_SIZE" ? 413 : 400;
    message = error.message || "File upload error";
  }

  // Sanitize 500 errors in production
  if (status === 500 && process.env.NODE_ENV === "production") {
    message = "Internal server error";
  }

  res.status(status).json({
    success: false,
    message,
    requestId: req.id || null,
    ...(details && { details }),
  });
}