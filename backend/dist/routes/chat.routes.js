/**
 * Chat routes
 */
import { Router } from "express";
import { groqService } from "../services/groq.service.js";
import { analyticsService } from "../services/analytics.service.js";
import { validateChatRequest } from "../middleware/validation.js";
const router = Router();
const VPN_TOPIC_KEYWORDS = [
    "vpn",
    "connection",
    "disconnect",
    "disconnects",
    "speed",
    "latency",
    "server",
    "billing",
    "account",
    "subscription",
    "login",
    "password",
    "privacy",
    "performance",
    "encryption",
    "protocol",
    "security",
    "subscription",
    "streaming",
];
const OFF_TOPIC_KEYWORDS = [
    "joke",
    "movie",
    "music",
    "weather",
    "sports",
    "politics",
    "recipe",
    "travel",
    "health",
    "news",
    "stock",
    "finance",
    "investment",
    "game",
    "coding",
    "programming",
    "history",
    "science",
];
function isOffTopicQuestion(message) {
    const normalized = message.toLowerCase();
    if (VPN_TOPIC_KEYWORDS.some((keyword) => normalized.includes(keyword))) {
        return false;
    }
    if (OFF_TOPIC_KEYWORDS.some((keyword) => normalized.includes(keyword))) {
        return true;
    }
    return false;
}
function countUserMessages(messages) {
    return messages.filter((message) => message.role === "user").length;
}
function recordAnalytics(sessionId, durationMs, userMessageCount, offTopic) {
    if (!sessionId) {
        return;
    }
    analyticsService.recordActivity(sessionId, durationMs, userMessageCount, offTopic);
}
/**
 * POST /api/chat
 * Accepts user messages and returns AI-generated response
 */
router.post("/chat", validateChatRequest, async (req, res) => {
    try {
        const { messages, sessionId } = req.body;
        const lastUserMessage = messages[messages.length - 1]?.content || "";
        if (isOffTopicQuestion(lastUserMessage)) {
            const offTopicReply = "I'm specialized in VPN support. Please ask me about connection issues, server selection, account help, or performance tips.";
            recordAnalytics(sessionId, 0, countUserMessages(messages), true);
            res.json({ reply: offTopicReply, offTopic: true });
            return;
        }
        const startTime = Date.now();
        const reply = await groqService.getResponse(messages);
        const elapsed = Date.now() - startTime;
        recordAnalytics(sessionId, elapsed, countUserMessages(messages), false);
        res.json({ reply });
    }
    catch (error) {
        console.error("Chat endpoint error:", error);
        res.status(500).json({
            error: "AI service temporarily unavailable. Please try again.",
        });
    }
});
/**
 * POST /api/chat/stream
 * Streams AI response chunks using Server-Sent Events (SSE)
 */
router.post("/chat/stream", validateChatRequest, async (req, res) => {
    const { messages, sessionId } = req.body;
    const lastUserMessage = messages[messages.length - 1]?.content || "";
    if (isOffTopicQuestion(lastUserMessage)) {
        const offTopicReply = "I'm specialized in VPN support. Please ask me about connection issues, server selection, account help, or performance tips.";
        recordAnalytics(sessionId, 0, countUserMessages(messages), true);
        res.setHeader("Content-Type", "application/json");
        res.json({ reply: offTopicReply, offTopic: true });
        return;
    }
    res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
    res.setHeader("Cache-Control", "no-cache, no-transform");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders?.();
    const startTime = Date.now();
    let isCompleted = false;
    const sendEvent = (event, payload) => {
        res.write(`event: ${event}\n`);
        res.write(`data: ${JSON.stringify(payload)}\n\n`);
    };
    try {
        const fullReply = await groqService.streamResponse(messages, (delta) => {
            sendEvent("message", { delta });
        });
        const elapsed = Date.now() - startTime;
        recordAnalytics(sessionId, elapsed, countUserMessages(messages), false);
        sendEvent("done", { reply: fullReply });
        isCompleted = true;
        res.end();
    }
    catch (error) {
        console.error("Chat stream error:", error);
        sendEvent("error", {
            error: "Streaming AI service temporarily unavailable. Please try again.",
        });
        res.end();
    }
    req.on("close", () => {
        if (!isCompleted) {
            console.warn("Client closed SSE connection before stream finished");
        }
    });
});
/**
 * GET /api/session/:sessionId/analytics
 * Returns session-level metrics for the given session.
 */
router.get("/session/:sessionId/analytics", (req, res) => {
    const { sessionId } = req.params;
    const metrics = analyticsService.getSessionAnalytics(sessionId);
    if (!metrics) {
        res.status(404).json({ error: "No analytics found for this session." });
        return;
    }
    res.json(metrics);
});
export default router;
