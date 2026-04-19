import { Router } from "express";
import jobRoutes from "./job.routes.js";
import geminiRoutes from "./gemini.routes.js";
import resumeRoutes from "./resume.routes.js";

const router = Router();

// Health check — confirms the server and DB are alive
// This is the only route wired on Day 1
router.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      status: "ok",
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
    },
  });
});

// Stub placeholders — uncomment as each feature is built
router.use("/jobs", jobRoutes);
router.use("/analyze", geminiRoutes);
router.use("/resume", resumeRoutes);

export default router;
