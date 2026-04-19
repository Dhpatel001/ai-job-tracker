import { z } from "zod";
import { JOB_STATUSES } from "../config/constants.js";

// ─── Create Job ─────────────────────────────────────────────────────────────
// Used on POST /api/jobs
// Only title, company, and description are required from the user.
// Skills/redFlags are filled later by Gemini — not accepted on creation.
export const createJobSchema = z.object({
  body: z.object({
    title: z
      .string({ required_error: "Job title is required" })
      .trim()
      .min(2, "Title must be at least 2 characters")
      .max(150, "Title cannot exceed 150 characters"),

    company: z
      .string({ required_error: "Company name is required" })
      .trim()
      .min(1, "Company name is required")
      .max(100, "Company name cannot exceed 100 characters"),

    description: z
      .string({ required_error: "Job description is required" })
      .trim()
      .min(50, "Description too short — paste more of the job posting")
      .max(20000, "Description too long"),

    status: z
      .enum(Object.values(JOB_STATUSES), {
        errorMap: () => ({
          message: `Status must be one of: ${Object.values(JOB_STATUSES).join(", ")}`,
        }),
      })
      .optional(),

    jobUrl: z
      .string()
      .url("jobUrl must be a valid URL")
      .optional()
      .or(z.literal("")),

    notes: z
      .string()
      .max(2000, "Notes cannot exceed 2000 characters")
      .optional(),
  }),
});

// ─── Update Job ─────────────────────────────────────────────────────────────
// Used on PATCH /api/jobs/:id
// All fields optional — user can update just the status, just the notes, etc.
export const updateJobSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[a-f\d]{24}$/i, "Invalid job ID format"),
  }),
  body: z
    .object({
      title: z.string().trim().min(2).max(150).optional(),
      company: z.string().trim().min(1).max(100).optional(),
      description: z.string().trim().min(50).max(20000).optional(),
      status: z
        .enum(Object.values(JOB_STATUSES), {
          errorMap: () => ({
            message: `Status must be one of: ${Object.values(JOB_STATUSES).join(", ")}`,
          }),
        })
        .optional(),
      jobUrl: z.string().url().optional().or(z.literal("")),
      notes: z.string().max(2000).optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: "At least one field must be provided to update",
    }),
});

// ─── Get/Delete by ID ───────────────────────────────────────────────────────
export const jobIdSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[a-f\d]{24}$/i, "Invalid job ID format"),
  }),
});

// ─── List Jobs (query params) ───────────────────────────────────────────────
export const listJobsSchema = z.object({
  query: z.object({
    status: z
      .enum(Object.values(JOB_STATUSES))
      .optional(),
    page: z
      .string()
      .regex(/^\d+$/, "Page must be a number")
      .transform(Number)
      .optional(),
    limit: z
      .string()
      .regex(/^\d+$/, "Limit must be a number")
      .transform(Number)
      .refine((n) => n <= 100, "Limit cannot exceed 100")
      .optional(),
    sortBy: z
      .enum(["createdAt", "updatedAt", "company", "title"])
      .optional(),
    order: z.enum(["asc", "desc"]).optional(),
  }),
});
