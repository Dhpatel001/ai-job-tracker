import { z } from "zod";

/**
 * Validate POST /api/analyze request body.
 * The user pastes the raw job description — we don't validate it heavily,
 * just ensure it's not empty and not absurdly long.
 */
export const analyzeJobSchema = z.object({
  body: z.object({
    jobDescription: z
      .string({ required_error: "Job description is required" })
      .trim()
      .min(100, "Job description too short — paste the full posting, not a snippet")
      .max(20000, "Job description too long — paste only the relevant sections"),

    // Optional: if user already created a job, they can pass its ID
    // and we'll update it. If not passed, we just return the analysis.
    jobId: z
      .string()
      .regex(/^[a-f\d]{24}$/i, "Invalid job ID format")
      .optional(),
  }),
});
