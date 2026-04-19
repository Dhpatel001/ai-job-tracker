import * as geminiService from "../services/gemini.service.js";

/**
 * POST /api/analyze
 * Takes a job description, runs AI analysis, optionally updates a job record.
 */
export const analyzeJob = async (req, res, next) => {
  try {
    const { jobDescription, jobId } = req.body;

    const analysis = await geminiService.analyzeJobDescription(
      jobDescription,
      jobId
    );

    res.status(200).json({ success: true, data: analysis });
  } catch (err) {
    next(err);
  }
};
