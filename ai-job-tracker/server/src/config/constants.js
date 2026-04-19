export const JOB_STATUSES = Object.freeze({
  APPLIED: "Applied",
  INTERVIEW: "Interview",
  OFFER: "Offer",
  REJECTED: "Rejected",
});

export const GEMINI_MODEL = "gemini-2.5-flash";

// Rate limit: max requests per window per IP
export const RATE_LIMIT = {
  WINDOW_MS: 15 * 60 * 1000, // 15 minutes
  MAX_REQUESTS: 300,
  GEMINI_MAX_REQUESTS: 10, // tighter limit on the AI route — it costs money
};