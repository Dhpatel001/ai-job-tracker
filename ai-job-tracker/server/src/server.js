import express from "express";
import helmet from "helmet";
import cors from "cors";

import { env } from "./config/env.js";
import { connectDB, disconnectDB } from "./config/db.js";
import { requestLogger } from "./middleware/requestLogger.js";
import { apiLimiter } from "./middleware/rateLimiter.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";
import router from "./routes/index.js";

const app = express();

// ─── Security Headers ──────────────────────────────────────────────────────
// Helmet sets ~14 HTTP headers that protect against common attacks
app.use(helmet());

// ─── CORS ──────────────────────────────────────────────────────────────────
// Never use `*` — only allow known origins
const allowedOrigins = env.ALLOWED_ORIGINS.split(",").map((o) => o.trim());

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. curl, Postman during dev)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS: Origin ${origin} not allowed`));
      }
    },
    credentials: true,
  })
);

// ─── Body Parsing ──────────────────────────────────────────────────────────
app.use(express.json({ limit: "50kb" })); // 50kb cap — job descriptions aren't novels
app.use(express.urlencoded({ extended: true }));

// ─── Logging ───────────────────────────────────────────────────────────────
app.use(requestLogger);

// ─── Rate Limiting ─────────────────────────────────────────────────────────
app.use("/api", apiLimiter);

// ─── Routes ────────────────────────────────────────────────────────────────
app.use("/api", router);

// ─── 404 + Error Handlers (must be LAST) ──────────────────────────────────
app.use(notFoundHandler);
app.use(errorHandler);

// ─── Bootstrap ────────────────────────────────────────────────────────────
const start = async () => {
  await connectDB();

  const server = app.listen(env.PORT, () => {
    console.log(`🚀 Server running on port ${env.PORT} [${env.NODE_ENV}]`);
    console.log(`   Health check → http://localhost:${env.PORT}/api/health`);
  });

  // ─── Graceful Shutdown ─────────────────────────────────────────────────
  // On CTRL+C or process kill — close DB before exiting
  const shutdown = async (signal) => {
    console.log(`\n⚡ ${signal} received. Shutting down gracefully...`);
    server.close(async () => {
      await disconnectDB();
      console.log("✅ Server closed.");
      process.exit(0);
    });
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
};

start();