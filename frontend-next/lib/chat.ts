export type Message = {
  role: "user" | "assistant";
  content: string;
};

export type ChatResponsePayload = {
  reply: string;
  offTopic?: boolean;
};

export type SessionAnalytics = {
  sessionId: string;
  requests: number;
  messagesExchanged: number;
  totalResponseTimeMs: number;
  averageResponseTimeMs: number;
  offTopicRequests: number;
  lastInteraction: string;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
const SESSION_STORAGE_KEY = "vpn-chat-assistant-session-id";
console.log("---API_URL----", API_URL);
export function getOrCreateSessionId(): string {
  if (typeof window !== "undefined") {
    const existingId = window.localStorage.getItem(SESSION_STORAGE_KEY);
    if (existingId) {
      console.log("----existingId----", existingId);
      return existingId;
    }

    const newId =
      typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : `sess-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

    window.localStorage.setItem(SESSION_STORAGE_KEY, newId);
    console.log("----newId----", newId);
    return newId;
  }

  return `sess-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function parseSSE(rawEvent: string) {
  const lines = rawEvent.split("\n");
  const event: { event: string; data: string } = {
    event: "message",
    data: "",
  };

  for (const line of lines) {
    if (line.startsWith("event:")) {
      event.event = line.replace("event:", "").trim();
    } else if (line.startsWith("data:")) {
      event.data += line.replace("data:", "").trim();
    }
  }

  return event;
}

export async function fetchChatStream(
  messages: Message[],
  sessionId: string,
  onDelta: (delta: string) => void,
): Promise<ChatResponsePayload> {
  const response = await fetch(`${API_URL}/chat/stream`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages, sessionId }),
  });

  const contentType = response.headers.get("content-type") || "";

  if (!response.ok) {
    if (contentType.includes("application/json")) {
      const data = await response.json();
      throw new Error(data.error || "Failed to stream response");
    }
    throw new Error("Failed to stream response");
  }

  if (contentType.includes("application/json")) {
    const data = await response.json();
    return {
      reply: data.reply,
      offTopic: data.offTopic,
    };
  }

  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error("Streaming not supported by this browser");
  }

  const decoder = new TextDecoder();
  let buffer = "";
  let finalReply = "";

  while (true) {
    const { done, value } = await reader.read();
    if (value) {
      buffer += decoder.decode(value, { stream: true });
      let eventEndIndex = buffer.indexOf("\n\n");

      while (eventEndIndex !== -1) {
        const rawEvent = buffer.slice(0, eventEndIndex);
        buffer = buffer.slice(eventEndIndex + 2);
        const parsed = parseSSE(rawEvent);

        if (parsed.event === "message") {
          const payload = JSON.parse(parsed.data);
          const delta = payload.delta as string;
          if (delta) {
            finalReply += delta;
            onDelta(delta);
          }
        } else if (parsed.event === "done") {
          const payload = JSON.parse(parsed.data);
          return {
            reply: payload.reply ?? finalReply,
          };
        } else if (parsed.event === "error") {
          const payload = JSON.parse(parsed.data);
          throw new Error(payload.error || "Streaming failed");
        }

        eventEndIndex = buffer.indexOf("\n\n");
      }
    }

    if (done) {
      break;
    }
  }

  return { reply: finalReply };
}

export async function fetchSessionAnalytics(
  sessionId: string,
): Promise<SessionAnalytics> {
  const response = await fetch(
    `${API_URL}/session/${encodeURIComponent(sessionId)}/analytics`,
  );
  if (!response.ok) {
    throw new Error("Failed to fetch session analytics");
  }

  return response.json();
}
