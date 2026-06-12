/**
 * Chat-related TypeScript interfaces
 */

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface ChatRequest {
  sessionId?: string;
  messages: ChatMessage[];
}

export interface ChatResponse {
  reply: string;
  offTopic?: boolean;
}

export interface ErrorResponse {
  error: string;
}
