/**
 * Environment configuration
 */

import dotenv from "dotenv";

dotenv.config();

export const config = {
  PORT: process.env.PORT || 5000,
  GROQ_API_KEY: process.env.GROQ_API_KEY,
  AI_MODEL: process.env.AI_MODEL || "llama-3.3-70b-versatile",
  NODE_ENV: process.env.NODE_ENV || "development",
};

// Validate required environment variables
if (!config.GROQ_API_KEY) {
  console.error("❌ Error: GROQ_API_KEY is not set in environment variables");
  process.exit(1);
}
