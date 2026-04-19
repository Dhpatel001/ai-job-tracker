import { GoogleGenerativeAI } from "@google/generative-ai";
import { env } from "../config/env.js";
import { Job } from "../models/Job.model.js";
import { GEMINI_MODEL } from "../config/constants.js";

const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);

// ─── Gemini Call with Retry + Timeout ────────────────────────────────────────

/**
 * Calls Gemini API with exponential backoff retry and timeout.
 * If all retries fail or timeout exceeded, throws a descriptive error.
 */
const callGeminiWithRetry = async (prompt, maxRetries = 3, timeoutMs = 30000) => {
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // Create a timeout promise — if Gemini takes longer than 30s, kill it
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Gemini API timeout")), timeoutMs)
      );

      const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });

      // Race between the actual API call and the timeout
      const response = await Promise.race([
        model.generateContent(prompt),
        timeoutPromise,
      ]);

      const text = response.response.text();
      return text;
    } catch (error) {
      lastError = error;

      // Don't retry on validation errors — they won't improve on retry
      if (error.message.includes("INVALID_ARGUMENT")) {
        throw error;
      }

      if (attempt < maxRetries) {
        // Exponential backoff: 1s, 2s, 4s
        const delay = 1000 * Math.pow(2, attempt - 1);
        console.warn(
          `⚠️  Gemini attempt ${attempt} failed. Retrying in ${delay}ms...`
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  // All retries exhausted
  const err = new Error("Failed to analyze job description with AI");
  err.statusCode = 503; // 503 Service Unavailable
  err.code = "AI_SERVICE_UNAVAILABLE";
  throw err;
};

// ─── Parse Gemini Response ───────────────────────────────────────────────────

/**
 * Gemini returns text, but we need structured JSON.
 * Prompt it to return ONLY JSON, then parse carefully.
 */
const parseGeminiResponse = (rawText) => {
  try {
    // Strip markdown code fences if Gemini wrapped it
    const cleaned = rawText
      .replace(/^```json\n?/, "")
      .replace(/\n?```$/, "")
      .trim();

    const parsed = JSON.parse(cleaned);

    // Validate the shape — ensure required fields exist
    if (
      !parsed.skills ||
      !Array.isArray(parsed.skills) ||
      !parsed.redFlags ||
      !Array.isArray(parsed.redFlags)
    ) {
      throw new Error("Gemini response missing required fields");
    }

    return {
      skills: parsed.skills.filter(Boolean).slice(0, 20), // cap at 20 skills
      experience: parsed.experience || "",
      responsibilities: (parsed.responsibilities || [])
        .filter(Boolean)
        .slice(0, 10),
      redFlags: parsed.redFlags.filter(Boolean).slice(0, 15),
    };
  } catch (error) {
    console.error("Failed to parse Gemini response:", error.message);
    throw new Error("AI returned invalid response format");
  }
};

// ─── Main Analysis Function ──────────────────────────────────────────────────

/**
 * Analyzes a job description using Gemini.
 * Extracts skills, experience level, responsibilities, and red flags.
 *
 * @param {string} jobDescription - Raw job posting text
 * @param {string} [jobId] - Optional MongoDB job ID to update
 * @returns {Object} { skills, experience, responsibilities, redFlags, jobId }
 */
export const analyzeJobDescription = async (jobDescription, jobId = null) => {
  // System prompt tells Gemini exactly what format to return
  const prompt = `You are a job description analyzer. Extract the following from this job description and RETURN ONLY VALID JSON with NO other text:

{
  "skills": ["skill1", "skill2", ...],
  "experience": "X years of Y experience",
  "responsibilities": ["responsibility1", "responsibility2", ...],
  "redFlags": ["flag1", "flag2", ...]
}

Look for:
- Required skills (technical and soft skills)
- Experience level required
- Key responsibilities (main duties)
- Red flags (unpaid trial, no salary, overqualified, toxic language, constant on-call)

If a field is unclear, use empty array [] or empty string "".

Job Description:
${jobDescription}`;

  // Call Gemini with retry + timeout
  const rawResponse = await callGeminiWithRetry(
    prompt,
    3, // 3 retry attempts
    30000 // 30 second timeout
  );

  // Parse the response into structured data
  const analysis = parseGeminiResponse(rawResponse);

  // If jobId was provided, update the job document
  if (jobId) {
    const updatedJob = await Job.findByIdAndUpdate(
      jobId,
      {
        skills: analysis.skills,
        experience: analysis.experience,
        responsibilities: analysis.responsibilities,
        redFlags: analysis.redFlags,
      },
      { new: true, runValidators: true }
    );

    if (!updatedJob) {
      const err = new Error("Job not found");
      err.statusCode = 404;
      err.code = "JOB_NOT_FOUND";
      throw err;
    }

    return { ...analysis, jobId: updatedJob._id };
  }

  // Just return the analysis (no job update)
  return analysis;
};
