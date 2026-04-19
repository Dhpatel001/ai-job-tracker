import rateLimit from "express-rate-limit";
import { RATE_LIMIT } from "../config/constants.js";

// General API rate limiter — applied to all routes
export const apiLimiter = rateLimit({
  windowMs: RATE_LIMIT.WINDOW_MS,
  max: RATE_LIMIT.MAX_REQUESTS,
  standardHeaders: true,  // Return rate limit info in RateLimit-* headers
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: "RATE_LIMITED",
      message: "Too many requests. Please wait and try again.",
    },
  },
});

// Tighter limiter specifically for the Gemini analysis route
// — each call hits a paid external API, so abuse here costs money
export const geminiLimiter = rateLimit({
  windowMs: RATE_LIMIT.WINDOW_MS,
  max: RATE_LIMIT.GEMINI_MAX_REQUESTS,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: "AI_RATE_LIMITED",
      message: "AI analysis limit reached. Wait 15 minutes before analyzing again.",
    },
  },
});