"use client";

import React, { useEffect, useRef, useState } from "react";
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
  const [error, setError] = useState<string | null>(null);
  const [offTopic, setOffTopic] = useState(false);
  const [sessionId, setSessionId] = useState("");
  const [analytics, setAnalytics] = useState<SessionAnalytics | null>(null);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

    setMessages((prev) => [
      ...prev,
      userMessage,
      { role: "assistant", content: "" },
    ]);
    setError(null);
    setOffTopic(false);
    setIsLoading(true);

    try {
      let accumulatedText = "";
      const response = await fetchChatStream(
        [...messages, userMessage],
        sessionId,
        (delta) => {
          accumulatedText += delta;
          setMessages((prev) => {
            const next = [...prev];
            const assistant = next[assistantIndex];
            if (assistant?.role === "assistant") {
              next[assistantIndex] = { ...assistant, content: accumulatedText };
            }
            return next;
          });
        },
      );

      if (response.offTopic) {
        setOffTopic(true);
        // For off-topic responses, update the message with the reply since no streaming occurs
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
        <header className="rounded-[32px] border border-slate-200 bg-white/90 p-6 shadow-sm backdrop-blur-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-sky-600">
                VPN Support
              </p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
                AI VPN Assistant
              </h1>
            </div>
            <p className="max-w-xl text-sm leading-6 text-slate-600 sm:text-right">
              Ask anything about VPN setup, troubleshooting, server choice,
              billing, and performance.
            </p>
          </div>
        </header>

        {analytics && (
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setShowAnalytics((prev) => !prev)}
              className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
            >
              {showAnalytics ? "Hide analytics" : "Show analytics"}
            </button>
          </div>
        )}

        {showAnalytics && analytics && (
          <section className="rounded-[32px] border border-slate-200 bg-white p-4 shadow-sm">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 text-xs text-slate-600">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                <p className="uppercase tracking-[0.3em] text-slate-500">
                  Session
                </p>
                <p className="mt-1 font-semibold text-slate-900">
                  {analytics.sessionId}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                <p className="uppercase tracking-[0.3em] text-slate-500">
                  Requests
                </p>
                <p className="mt-1 font-semibold text-slate-900">
                  {analytics.requests}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                <p className="uppercase tracking-[0.3em] text-slate-500">
                  Messages
                </p>
                <p className="mt-1 font-semibold text-slate-900">
                  {analytics.messagesExchanged}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                <p className="uppercase tracking-[0.3em] text-slate-500">
                  Off-topic
                </p>
                <p className="mt-1 font-semibold text-slate-900">
                  {analytics.offTopicRequests}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                <p className="uppercase tracking-[0.3em] text-slate-500">
                  Avg latency
                </p>
                <p className="mt-1 font-semibold text-slate-900">
                  {Math.round(analytics.averageResponseTimeMs)} ms
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                <p className="uppercase tracking-[0.3em] text-slate-500">
                  Last interaction
                </p>
                <p className="mt-1 font-semibold text-slate-900">
                  {new Date(analytics.lastInteraction).toLocaleString()}
                </p>
              </div>
            </div>
          </section>
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
                <ChatMessage key={idx} role={msg.role} content={msg.content} />
              ))}
              {isLoading && <LoadingDots />}
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
