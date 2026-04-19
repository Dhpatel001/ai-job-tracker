import { env } from "../config/env.js";

const JSEARCH_BASE_URL = "https://jsearch.p.rapidapi.com";

/**
 * Searches for jobs using the JSearch API (RapidAPI).
 * Aggregates results from LinkedIn, Indeed, Glassdoor, and more.
 *
 * @param {Object} options
 * @param {string}   options.query       - Search query (e.g. "React Developer")
 * @param {string}   [options.location]  - Location filter (e.g. "Remote", "New York")
 * @param {boolean}  [options.remoteOnly] - Filter for remote jobs only
 * @param {string}   [options.datePosted] - "today", "3days", "week", "month", "all"
 * @param {string}   [options.employmentType] - "FULLTIME", "PARTTIME", "CONTRACTOR", "INTERN"
 * @param {number}   [options.page]      - Page number (default 1)
 * @returns {Object} { jobs: [...], totalFound: number }
 */
export const searchJobs = async ({
  query,
  location = "",
  remoteOnly = false,
  datePosted = "month",
  employmentType = "",
  page = 1,
} = {}) => {
  if (!env.RAPIDAPI_KEY) {
    const err = new Error(
      "Job search is not configured. Add your RAPIDAPI_KEY to server/.env"
    );
    err.statusCode = 503;
    err.code = "SEARCH_NOT_CONFIGURED";
    throw err;
  }

  // Build the search query
  let searchQuery = query;
  if (location && !remoteOnly) {
    searchQuery += ` in ${location}`;
  } else if (remoteOnly) {
    searchQuery += " remote";
  }

  const params = new URLSearchParams({
    query: searchQuery,
    page: String(page),
    num_pages: "1",
    date_posted: datePosted,
  });

  if (remoteOnly) {
    params.set("remote_jobs_only", "true");
  }

  if (employmentType) {
    params.set("employment_types", employmentType);
  }

  const url = `${JSEARCH_BASE_URL}/search?${params.toString()}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "X-RapidAPI-Key": env.RAPIDAPI_KEY,
      "X-RapidAPI-Host": "jsearch.p.rapidapi.com",
    },
  });

  if (!response.ok) {
    const statusCode = response.status;

    if (statusCode === 429) {
      const err = new Error("Job search API rate limit reached. Try again later.");
      err.statusCode = 429;
      throw err;
    }

    if (statusCode === 403) {
      const err = new Error("Invalid RapidAPI key. Check your RAPIDAPI_KEY in server/.env");
      err.statusCode = 403;
      throw err;
    }

    const err = new Error(`Job search API error (${statusCode})`);
    err.statusCode = 502;
    throw err;
  }

  const data = await response.json();

  // Normalize the response into a clean format
  const jobs = (data.data || []).map((job) => ({
    id: job.job_id,
    title: job.job_title,
    company: job.employer_name,
    companyLogo: job.employer_logo,
    location: job.job_city
      ? `${job.job_city}${job.job_state ? ", " + job.job_state : ""}${job.job_country ? ", " + job.job_country : ""}`
      : job.job_country || "Unknown",
    isRemote: job.job_is_remote || false,
    employmentType: job.job_employment_type || "Unknown",
    description: job.job_description
      ? job.job_description.slice(0, 500) + "..."
      : "",
    salary: formatSalary(job),
    applyLink: job.job_apply_link,
    source: job.job_publisher || "Unknown",
    postedAt: job.job_posted_at_datetime_utc,
    expiresAt: job.job_offer_expiration_datetime_utc,
  }));

  return {
    jobs,
    totalFound: data.total_count || jobs.length,
    searchQuery: searchQuery,
  };
};

/**
 * Formats salary from JSearch response into a readable string.
 */
function formatSalary(job) {
  const min = job.job_min_salary;
  const max = job.job_max_salary;
  const period = job.job_salary_period;
  const currency = job.job_salary_currency || "USD";

  if (!min && !max) return null;

  const fmt = (n) => {
    if (n >= 1000) return `${Math.round(n / 1000)}K`;
    return String(n);
  };

  if (min && max) {
    return `${currency} ${fmt(min)} - ${fmt(max)}${period ? ` / ${period.toLowerCase()}` : ""}`;
  }

  return `${currency} ${fmt(min || max)}${period ? `+ / ${period.toLowerCase()}` : ""}`;
}

/**
 * Searches for jobs using multiple queries (from resume analysis) and merges results.
 * De-duplicates by job_id.
 */
export const searchJobsMultiQuery = async (queries, options = {}) => {
  const allJobs = [];
  const seenIds = new Set();

  for (const query of queries.slice(0, 3)) {
    try {
      const result = await searchJobs({ ...options, query });
      for (const job of result.jobs) {
        if (!seenIds.has(job.id)) {
          seenIds.add(job.id);
          allJobs.push(job);
        }
      }
    } catch (error) {
      console.warn(`Search query "${query}" failed:`, error.message);
    }
  }

  return {
    jobs: allJobs,
    totalFound: allJobs.length,
  };
};
