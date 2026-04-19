import morgan from "morgan";
import { env } from "../config/env.js";

// Dev: colorized, human-readable output
// Production: JSON-style compact log (easier to ingest into log services)
const format =
  env.NODE_ENV === "production"
    ? ':remote-addr :method :url :status :res[content-length] - :response-time ms'
    : "dev";

export const requestLogger = morgan(format);