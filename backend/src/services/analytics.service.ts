/**
 * Session analytics service
 * Tracks simple metrics per session for monitoring and UX improvements.
 */

export interface SessionAnalytics {
  sessionId: string;
  requests: number;
  messagesExchanged: number;
  totalResponseTimeMs: number;
  averageResponseTimeMs: number;
  offTopicRequests: number;
  lastInteraction: string;
}

class AnalyticsService {
  private sessions = new Map<string, SessionAnalytics>();

  recordActivity(
    sessionId: string,
    responseTimeMs: number,
    messageCount: number,
    offTopic: boolean,
  ): SessionAnalytics {
    const now = new Date().toISOString();
    const existing = this.sessions.get(sessionId);

    const metrics: SessionAnalytics = existing
      ? {
          ...existing,
          requests: existing.requests + 1,
          messagesExchanged: messageCount,
          totalResponseTimeMs: existing.totalResponseTimeMs + responseTimeMs,
          averageResponseTimeMs:
            (existing.totalResponseTimeMs + responseTimeMs) /
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

  getSessionAnalytics(sessionId: string): SessionAnalytics | null {
    return this.sessions.get(sessionId) ?? null;
  }
}

export const analyticsService = new AnalyticsService();
