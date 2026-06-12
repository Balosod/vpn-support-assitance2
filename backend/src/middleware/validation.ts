/**
 * Input validation middleware
 */

import { Request, Response, NextFunction } from "express";
import { ChatRequest } from "../types/chat.js";

/**
 * Validates chat request body
 */
export const validateChatRequest = (
  req: Request<{}, {}, ChatRequest>,
  res: Response,
  next: NextFunction,
): void => {
  try {
    const { messages } = req.body;

    // Check if messages array exists
    if (!messages || !Array.isArray(messages)) {
      res.status(400).json({ error: "Invalid messages array" });
      return;
    }

    // Check if messages is not empty
    if (messages.length === 0) {
      res.status(400).json({ error: "Messages array cannot be empty" });
      return;
    }

    // Validate each message
    for (const msg of messages) {
      if (!msg.content || typeof msg.content !== "string") {
        res.status(400).json({ error: "Each message must have content" });
        return;
      }

      if (msg.content.trim().length === 0) {
        res.status(400).json({ error: "Message content cannot be empty" });
        return;
      }

      if (!["user", "assistant"].includes(msg.role)) {
        res.status(400).json({
          error: "Invalid message role. Must be 'user' or 'assistant'",
        });
        return;
      }
    }

    // Validation passed
    next();
  } catch (error) {
    res.status(400).json({ error: "Invalid request format" });
  }
};

/**
 * Global error handling middleware
 */
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  console.error("Unhandled error:", err.message);
  res.status(500).json({
    error: "AI service temporarily unavailable. Please try again.",
  });
};
