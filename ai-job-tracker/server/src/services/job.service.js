import { Job } from "../models/Job.model.js";

// ─── Create ─────────────────────────────────────────────────────────────────
/**
 * Creates a new job application.
 * @param {Object} data - Validated job payload from the controller
 * @returns {Object} The created job document
 */
export const createJob = async (data) => {
  const job = new Job(data);
  await job.save();
  return job;
};

// ─── Get All (with filters + pagination) ────────────────────────────────────
/**
 * Returns a paginated list of jobs.
 * Filtering by status is optional — if not passed, returns all.
 *
 * @param {Object} options
 * @param {string}  [options.status]  - Filter by job status
 * @param {number}  [options.page=1]
 * @param {number}  [options.limit=20]
 * @param {string}  [options.sortBy="createdAt"]
 * @param {string}  [options.order="desc"]
 */
export const getAllJobs = async ({
  status,
  page = 1,
  limit = 20,
  sortBy = "createdAt",
  order = "desc",
} = {}) => {
  const filter = {};
  if (status) filter.status = status;

  const sortDirection = order === "asc" ? 1 : -1;
  const skip = (page - 1) * limit;

  // Run count and find in parallel — two DB queries, same time cost as one
  const [total, jobs] = await Promise.all([
    Job.countDocuments(filter),
    Job.find(filter)
      .sort({ [sortBy]: sortDirection })
      .skip(skip)
      .limit(limit)
      // statusHistory can be large — exclude from list view for performance
      .select("-statusHistory -description")
      .lean(), // .lean() returns plain JS objects, not Mongoose docs — faster for read-only
  ]);

  return {
    jobs,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page < Math.ceil(total / limit),
      hasPrevPage: page > 1,
    },
  };
};

// ─── Get One ─────────────────────────────────────────────────────────────────
/**
 * Fetches a single job by ID.
 * Throws a 404-shaped error if not found — errorHandler.js catches it.
 */
export const getJobById = async (id) => {
  const job = await Job.findById(id).lean();

  if (!job) {
    const err = new Error("Job not found");
    err.statusCode = 404;
    err.code = "JOB_NOT_FOUND";
    throw err;
  }

  return job;
};

// ─── Update ──────────────────────────────────────────────────────────────────
/**
 * Partially updates a job.
 * Uses { new: true } so the returned document reflects the changes.
 * runValidators ensures Mongoose schema rules still apply on update.
 */
export const updateJob = async (id, data) => {
  const job = await Job.findById(id);

  if (!job) {
    const err = new Error("Job not found");
    err.statusCode = 404;
    err.code = "JOB_NOT_FOUND";
    throw err;
  }

  Object.assign(job, data);
  await job.save();

  return job;
};

// ─── Delete ──────────────────────────────────────────────────────────────────
export const deleteJob = async (id) => {
  const job = await Job.findByIdAndDelete(id);

  if (!job) {
    const err = new Error("Job not found");
    err.statusCode = 404;
    err.code = "JOB_NOT_FOUND";
    throw err;
  }

  return { deleted: true, id };
};

// ─── Dashboard Stats ─────────────────────────────────────────────────────────
/**
 * Aggregates job counts grouped by status.
 * Used by the dashboard to populate the status summary cards.
 *
 * Returns: { Applied: 5, Interview: 2, Offer: 1, Rejected: 3, total: 11 }
 */
export const getJobStats = async () => {
  const results = await Job.aggregate([
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
      },
    },
  ]);

  // Convert array of { _id, count } into a flat object
  const stats = results.reduce((acc, { _id, count }) => {
    acc[_id] = count;
    return acc;
  }, {});

  stats.total = Object.values(stats).reduce((sum, n) => sum + n, 0);

  return stats;
};

