import { GoogleGenerativeAI } from "@google/generative-ai";
import { createRequire } from "module";
import { env } from "../config/env.js";
import { GEMINI_MODEL } from "../config/constants.js";

const require = createRequire(import.meta.url);
const { PDFParse } = require("pdf-parse");

const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);

/**
 * Extracts text from a PDF buffer using pdf-parse v2.
 */
export const parseResumePDF = async (buffer) => {
  const parser = new PDFParse({ data: new Uint8Array(buffer) });
  await parser.load();
  const rawText = await parser.getText();
  
  // getText() may return an array of page texts or an object — normalize to string
  let text = "";
  if (typeof rawText === "string") {
    text = rawText;
  } else if (Array.isArray(rawText)) {
    text = rawText.map((page) => (typeof page === "string" ? page : JSON.stringify(page))).join("\n");
  } else if (rawText && typeof rawText === "object") {
    text = Object.values(rawText).flat().join("\n");
  }

  if (!text || text.trim().length < 50) {
    const err = new Error(
      "Could not extract enough text from the PDF. Make sure it's not a scanned image."
    );
    err.statusCode = 400;
    throw err;
  }

  return text;
};

/**
 * Analyzes resume text with Gemini to extract structured data.
 * Returns skills, experience, preferred roles, and a summary.
 */
export const analyzeResumeWithAI = async (resumeText) => {
  const prompt = `You are a professional resume analyzer. Analyze this resume and RETURN ONLY VALID JSON with NO other text:

{
  "name": "Full name of the candidate",
  "skills": ["skill1", "skill2", ...],
  "experience_years": 3,
  "preferred_roles": ["Role 1", "Role 2", "Role 3"],
  "summary": "A brief 1-2 sentence professional summary",
  "top_search_queries": ["query1", "query2", "query3"]
}

Rules:
- "skills" should include all technical skills, tools, frameworks, and languages mentioned. Include both specific (e.g. "React") and broader (e.g. "Frontend Development") skills. Max 25 skills.
- "experience_years" should be the total years of professional experience (number).
- "preferred_roles" should be 3-5 job titles that best match this resume.
- "summary" should be a professional summary in 1-2 sentences.
- "top_search_queries" should be 3 optimized job search queries combining the candidate's top skills and preferred roles. These will be used to search job boards. Example: "Senior React Developer", "Full Stack Node.js Engineer", "Frontend Engineer TypeScript".

Resume:
${resumeText.slice(0, 8000)}`;

  const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });

  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error("Gemini API timeout")), 30000)
  );

  const response = await Promise.race([
    model.generateContent(prompt),
    timeoutPromise,
  ]);

  const rawText = response.response.text();

  try {
    const cleaned = rawText
      .replace(/^```json\n?/, "")
      .replace(/\n?```$/, "")
      .trim();

    const parsed = JSON.parse(cleaned);

    return {
      name: parsed.name || "Unknown",
      skills: (parsed.skills || []).filter(Boolean).slice(0, 25),
      experience_years: parsed.experience_years || 0,
      preferred_roles: (parsed.preferred_roles || []).filter(Boolean).slice(0, 5),
      summary: parsed.summary || "",
      top_search_queries: (parsed.top_search_queries || []).filter(Boolean).slice(0, 3),
    };
  } catch (error) {
    console.error("Failed to parse Gemini resume response:", error.message);
    const err = new Error("AI returned invalid response format for resume analysis");
    err.statusCode = 502;
    throw err;
  }
};
