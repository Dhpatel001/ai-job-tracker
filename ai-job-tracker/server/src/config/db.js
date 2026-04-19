import mongoose from "mongoose";
import { env } from "./env.js";

const MAX_RETRIES = 5;
const BASE_DELAY_MS = 1000; // doubles on each retry (exponential backoff)

/**
 * Connects to MongoDB with exponential backoff retry.
 * If all retries fail, the process exits — a broken DB connection
 * means the app cannot function, so a silent failure is worse.
 */
export const connectDB = async (attempt = 1) => {
  try {
    const conn = await mongoose.connect(env.MONGO_URI, {
      // Mongoose 8+ handles these internally, but explicit is better than implicit
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    if (attempt >= MAX_RETRIES) {
      console.error(`❌ MongoDB connection failed after ${MAX_RETRIES} attempts. Exiting.`);
      console.error(error.message);
      process.exit(1);
    }

    const delay = BASE_DELAY_MS * Math.pow(2, attempt - 1);
    console.warn(`⚠️  MongoDB connection attempt ${attempt} failed. Retrying in ${delay}ms...`);
    await new Promise((resolve) => setTimeout(resolve, delay));
    return connectDB(attempt + 1);
  }
};

// Graceful disconnect — called on SIGINT/SIGTERM in server.js
export const disconnectDB = async () => {
  await mongoose.connection.close();
  console.log("🔌 MongoDB connection closed.");
};