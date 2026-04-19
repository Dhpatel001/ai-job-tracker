import { Router } from "express";
import multer from "multer";
import * as resumeController from "../controllers/resume.controller.js";
import { geminiLimiter } from "../middleware/rateLimiter.js";

const router = Router();

// Multer config: store file in memory (buffer), accept only PDFs, max 5MB
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are accepted"), false);
    }
  },
});

/**
 * POST /api/resume/upload
 * Upload a PDF resume for AI analysis.
 * Rate limited because it calls Gemini.
 */
router.post(
  "/upload",
  geminiLimiter,
  upload.single("resume"),
  resumeController.uploadResume
);

/**
 * POST /api/resume/search
 * Search for jobs using extracted skills/queries.
 */
router.post("/search", resumeController.searchJobs);

export default router;
