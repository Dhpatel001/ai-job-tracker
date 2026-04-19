import * as resumeService from "../services/resume.service.js";
import * as jobSearchService from "../services/jobSearch.service.js";

/**
 * POST /api/resume/upload
 * Accepts a PDF resume, extracts text, analyzes with Gemini.
 */
export const uploadResume = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: { code: "NO_FILE", message: "No file uploaded. Please upload a PDF resume." },
      });
    }

    // 1. Extract text from PDF
    const resumeText = await resumeService.parseResumePDF(req.file.buffer);

    // 2. Analyze with Gemini
    const analysis = await resumeService.analyzeResumeWithAI(resumeText);

    res.status(200).json({
      success: true,
      data: analysis,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/resume/search
 * Searches for jobs using skills/queries from resume analysis.
 * Body: { queries: string[], location?: string, remoteOnly?: boolean, datePosted?: string, employmentType?: string }
 */
export const searchJobs = async (req, res, next) => {
  try {
    const { queries, location, remoteOnly, datePosted, employmentType, page } = req.body;

    if (!queries || !Array.isArray(queries) || queries.length === 0) {
      return res.status(400).json({
        success: false,
        error: { code: "NO_QUERIES", message: "Search queries are required." },
      });
    }

    const result = await jobSearchService.searchJobsMultiQuery(queries, {
      location,
      remoteOnly,
      datePosted,
      employmentType,
      page,
    });

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
};
