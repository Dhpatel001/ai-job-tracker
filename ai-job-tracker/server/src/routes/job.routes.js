import { Router } from "express";
import * as jobController from "../controllers/job.controller.js";
import { validate } from "../middleware/validateRequest.js";
import {
  createJobSchema,
  updateJobSchema,
  jobIdSchema,
  listJobsSchema,
} from "../validators/job.validator.js";

const router = Router();

// GET /api/jobs/stats  ← must come BEFORE /:id or Express matches "stats" as an ID
router.get("/stats", jobController.getStats);

// GET /api/jobs
router.get("/", validate(listJobsSchema), jobController.getAll);

// POST /api/jobs
router.post("/", validate(createJobSchema), jobController.create);

// GET /api/jobs/:id
router.get("/:id", validate(jobIdSchema), jobController.getOne);

// PATCH /api/jobs/:id
router.patch("/:id", validate(updateJobSchema), jobController.update);

// DELETE /api/jobs/:id
router.delete("/:id", validate(jobIdSchema), jobController.remove);

export default router;
