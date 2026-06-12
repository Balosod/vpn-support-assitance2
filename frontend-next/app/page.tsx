"use client";

import React, { useEffect, useRef, useState } from "react";
import ChatHeader from "./components/ChatHeader";
import AnalyticsPanel from "./components/AnalyticsPanel";
import ChatMessage from "./components/ChatMessage";
import ChatInput from "./components/ChatInput";
import LoadingDots from "./components/LoadingDots";

import {
  fetchChatStream,
  fetchSessionAnalytics,
  getOrCreateSessionId,
  Message,
  SessionAnalytics,
} from "../lib/chat";

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hi! I'm your VPN support assistant. Ask me about connection issues, server locations, billing, or performance tips.",
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [hasReceivedResponseChunk, setHasReceivedResponseChunk] =
    useState(false);
  const [typingMessageIndex, setTypingMessageIndex] = useState<number | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);
  const [offTopic, setOffTopic] = useState(false);
  const [sessionId, setSessionId] = useState("");
  const [analytics, setAnalytics] = useState<SessionAnalytics | null>(null);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pendingTypingRef = useRef("");
  const typingTimeoutRef = useRef<number | null>(null);
  const streamCompleteRef = useRef(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const id = getOrCreateSessionId();
    setSessionId(id);
    fetchSessionStatistics(id);
  }, []);

  const fetchSessionStatistics = async (id: string) => {
    try {
      const sessionData = await fetchSessionAnalytics(id);
      setAnalytics(sessionData);
    } catch {
      // Best-effort analytics loading
    }
  };

  const sendMessage = async (userInput: string) => {
    const trimmed = userInput.trim();
    if (!trimmed) return;

    const userMessage: Message = { role: "user", content: trimmed };
    const assistantIndex = messages.length + 1;

    pendingTypingRef.current = "";
    typingTimeoutRef.current = null;
    streamCompleteRef.current = false;
    setTypingMessageIndex(assistantIndex);
    setIsTyping(false);
    setHasReceivedResponseChunk(false);

    setMessages((prev) => [
      ...prev,
      userMessage,
      { role: "assistant", content: "" },
    ]);
    setError(null);
    setOffTopic(false);
    setIsLoading(true);

    const scheduleTyping = () => {
      const typeNext = () => {
        if (!pendingTypingRef.current) {
          typingTimeoutRef.current = null;
          if (streamCompleteRef.current) {
            setIsTyping(false);
            setTypingMessageIndex(null);
          }
          return;
        }

        const nextChar = pendingTypingRef.current[0];
        pendingTypingRef.current = pendingTypingRef.current.slice(1);

        setMessages((prev) => {
          const next = [...prev];
          const assistant = next[assistantIndex];
          if (assistant?.role === "assistant") {
            next[assistantIndex] = {
              ...assistant,
              content: assistant.content + nextChar,
            };
          }
          return next;
        });

        typingTimeoutRef.current = window.setTimeout(typeNext, 20);
      };

      typingTimeoutRef.current = window.setTimeout(typeNext, 20);
    };

    try {
      const response = await fetchChatStream(
        [...messages, userMessage],
        sessionId,
        (delta) => {
          if (!hasReceivedResponseChunk) {
            setHasReceivedResponseChunk(true);
            setIsTyping(true);
          }

          pendingTypingRef.current += delta;
          if (typingTimeoutRef.current === null) {
            scheduleTyping();
          }
        },
      );

      streamCompleteRef.current = true;
      if (typingTimeoutRef.current === null && !pendingTypingRef.current) {
        setIsTyping(false);
        setTypingMessageIndex(null);
      }

      if (response.offTopic) {
        setOffTopic(true);
        setMessages((prev) => {
          const next = [...prev];
          const assistant = next[assistantIndex];
          if (assistant?.role === "assistant") {
            next[assistantIndex] = { ...assistant, content: response.reply };
          }
          return next;
        });
      }

      await fetchSessionStatistics(sessionId);
    } catch (err: any) {
      streamCompleteRef.current = true;
      if (typingTimeoutRef.current === null && !pendingTypingRef.current) {
        setIsTyping(false);
        setTypingMessageIndex(null);
      }

      setError(err?.message ?? "Unable to stream response");
      setMessages((prev) => {
        const next = [...prev];
        const assistant = next[assistantIndex];
        if (assistant?.role === "assistant") {
          next[assistantIndex] = {
            ...assistant,
            content: `⚠️ ${err?.message ?? "Unable to load answer."}`,
          };
        }
        return next;
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-6">
      <div className="mx-auto flex h-[calc(100vh-3rem)] max-w-4xl flex-col gap-5 px-4 sm:h-[calc(100vh-4rem)]">
        <ChatHeader />

        {analytics && (
          <AnalyticsPanel
            analytics={analytics}
            showAnalytics={showAnalytics}
            onToggle={() => setShowAnalytics((prev) => !prev)}
          />
        )}

        <main className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-[32px] bg-white shadow-lg">
          <div className="flex-1 overflow-y-auto px-4 py-5 sm:px-6">
            <div className="space-y-4">
              {offTopic && (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700 shadow-sm">
                  ⚠️ I’m specialized in VPN support. Off-topic questions are
                  handled gracefully.
                </div>
              )}
              {messages.map((msg, idx) => (
                <ChatMessage
                  key={idx}
                  role={msg.role}
                  content={msg.content}
                  isTyping={isTyping && idx === typingMessageIndex}
                />
              ))}
              {isLoading && !hasReceivedResponseChunk && <LoadingDots />}
              {error && (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 shadow-sm">
                  ⚠️ {error}
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          <div className="border-t border-slate-200 bg-slate-50 px-4 py-4 sm:px-6">
            <ChatInput onSend={sendMessage} disabled={isLoading} />
          </div>
        </main>
      </div>
    </div>
  );
}
