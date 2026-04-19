import { z } from "zod";
import dotenv from "dotenv";

dotenv.config();

// Zod validates env at startup — if anything is missing,
// the server refuses to start instead of failing silently later.
const envSchema = z.object({
  PORT: z.string().default("5000"),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  MONGO_URI: z.string().min(1, "MONGO_URI is required"),
  ALLOWED_ORIGINS: z.string().default("http://localhost:5173"),
  GEMINI_API_KEY: z.string().optional(), // optional on Day 1
  RAPIDAPI_KEY: z.string().optional(),   // for JSearch job search API
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌ Invalid environment variables:");
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;