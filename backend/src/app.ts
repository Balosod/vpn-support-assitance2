/**
 * Express application setup
 */

import express, { Express } from "express";
import cors from "cors";
import chatRoutes from "./routes/chat.routes.js";
import { errorHandler } from "./middleware/validation.js";

export function createApp(): Express {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());

  // Routes
  app.use("/api", chatRoutes);

  // Health check endpoint
  app.get("/health", (req, res) => {
    res.json({ status: "OK", timestamp: new Date().toISOString() });
  });

  // Global error handler (must be last)
  app.use(errorHandler);

  return app;
}
