/**
 * Session analytics service
 * Tracks simple metrics per session for monitoring and UX improvements.
 */
class AnalyticsService {
    sessions = new Map();
    recordActivity(sessionId, responseTimeMs, messageCount, offTopic) {
        const now = new Date().toISOString();
        const existing = this.sessions.get(sessionId);
        const metrics = existing
            ? {
                ...existing,
                requests: existing.requests + 1,
                messagesExchanged: messageCount,
                totalResponseTimeMs: existing.totalResponseTimeMs + responseTimeMs,
                averageResponseTimeMs: (existing.totalResponseTimeMs + responseTimeMs) /
                    (existing.requests + 1),
                offTopicRequests: existing.offTopicRequests + (offTopic ? 1 : 0),
                lastInteraction: now,
            }
            : {
                sessionId,
                requests: 1,
                messagesExchanged: messageCount,
                totalResponseTimeMs: responseTimeMs,
                averageResponseTimeMs: responseTimeMs,
                offTopicRequests: offTopic ? 1 : 0,
                lastInteraction: now,
            };
        this.sessions.set(sessionId, metrics);
        return metrics;
    }
    getSessionAnalytics(sessionId) {
        return this.sessions.get(sessionId) ?? null;
    }
}
export const analyticsService = new AnalyticsService();
