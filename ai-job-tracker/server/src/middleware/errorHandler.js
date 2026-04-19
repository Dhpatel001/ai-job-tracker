import { env } from "../config/env.js";

/**
 * Centralised error middleware — catches everything passed via next(err).
 * Consistent shape: { success: false, error: { code, message } }
 * Stack traces are never sent to the client in production.
 */
export const errorHandler = (err, req, res, next) => {
  // Default to 500 unless the error carries a specific status
  const statusCode = err.statusCode || err.status || 500;

  // Mongoose validation error — convert to readable message
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: messages.join(", "),
      },
    });
  }

  // Mongoose bad ObjectId (e.g. /api/jobs/not-a-valid-id)
  if (err.name === "CastError") {
    return res.status(400).json({
      success: false,
      error: {
        code: "INVALID_ID",
        message: "The provided ID is not valid",
      },
    });
  }

  // MongoDB duplicate key
  if (err.code === 11000) {
    return res.status(409).json({
      success: false,
      error: {
        code: "DUPLICATE_KEY",
        message: "A record with this value already exists",
      },
    });
  }

  // Generic fallback
  res.status(statusCode).json({
    success: false,
    error: {
      code: err.code || "INTERNAL_ERROR",
      message: err.message || "An unexpected error occurred",
      // Only expose stack in development
      ...(env.NODE_ENV === "development" && { stack: err.stack }),
    },
  });
};

/**
 * 404 handler — place this BEFORE errorHandler in server.js
 * to catch requests to routes that don't exist.
 */
export const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: "NOT_FOUND",
      message: `Route ${req.method} ${req.originalUrl} does not exist`,
    },
  });
};