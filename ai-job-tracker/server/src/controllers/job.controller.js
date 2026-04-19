import * as jobService from "../services/job.service.js";
import { analyzeJobDescription } from "../services/gemini.service.js";

/**
 * Controllers are intentionally thin.
 * Their only jobs: parse the request, call the service, format the response.
 * Zero business logic lives here — that's the service's job.
 */

// POST /api/jobs
export const create = async (req, res, next) => {
  try {
    const job = await jobService.createJob(req.body);

    // Fire off AI analysis in the background — don't block the response
    analyzeJobDescription(job.description, job._id.toString()).catch((err) =>
      console.error("Background AI analysis failed:", err.message)
    );

    res.status(201).json({ success: true, data: job });
  } catch (err) {
    next(err); // passes to errorHandler middleware
  }
};

// GET /api/jobs
export const getAll = async (req, res, next) => {
  try {
    const result = await jobService.getAllJobs(req.query);
    res.status(200).json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
};

// GET /api/jobs/stats
export const getStats = async (req, res, next) => {
  try {
    const stats = await jobService.getJobStats();
    res.status(200).json({ success: true, data: stats });
  } catch (err) {
    next(err);
  }
};

// GET /api/jobs/:id
export const getOne = async (req, res, next) => {
  try {
    const job = await jobService.getJobById(req.params.id);
    res.status(200).json({ success: true, data: job });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/jobs/:id
export const update = async (req, res, next) => {
  try {
    const job = await jobService.updateJob(req.params.id, req.body);
    res.status(200).json({ success: true, data: job });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/jobs/:id
export const remove = async (req, res, next) => {
  try {
    const result = await jobService.deleteJob(req.params.id);
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};
