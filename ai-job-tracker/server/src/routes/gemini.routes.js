import { Router } from "express";
import * as geminiController from "../controllers/gemini.controller.js";
import { validate } from "../middleware/validateRequest.js";
import { geminiLimiter } from "../middleware/rateLimiter.js";
import { analyzeJobSchema } from "../validators/gemini.validator.js";

const router = Router();

/**
 * POST /api/analyze
 * Takes a job description, runs AI analysis.
 * Limited to 10 requests per 15 minutes to avoid API costs.
 */
router.post(
  "/",
  geminiLimiter, // Tight rate limit — this hits a paid API
  validate(analyzeJobSchema),
  geminiController.analyzeJob
);

export default router;
