"use client";

import { useEffect, useRef, useState } from "react";
import Nav from "../../components/Nav";
import RequireAuth from "../RequireAuth";
import { authFetch } from "../lib/auth";
import { API_BASE } from "../lib/api";
import type { ConversationMessage } from "../lib/types";

type Phase = "idle" | "asking" | "error";

const STORAGE_KEY = "kelana_chat_conversation_id";

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function ChatPage() {
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [title, setTitle] = useState<string | null>(null);
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [input, setInput] = useState("");
  const [phase, setPhase] = useState<Phase>("idle");
  const [error, setError] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  // Resume the last conversation on first open (PDF Part 7: reload messages
  // before continuing to chat).
  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) return;
    const id = Number(stored);
    authFetch(`/api/v1/conversations/${id}/messages`)
      .then((res) => (res.ok ? res.json() : Promise.reject(res)))
      .then((rows: ConversationMessage[]) => {
        setConversationId(id);
        setMessages(rows);
        if (rows[0]) setTitle(rows[0].content.slice(0, 60));
      })
      .catch(() => window.localStorage.removeItem(STORAGE_KEY));
  }, []);

  // Auto-scroll to the latest message on open and on every new message.
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [messages.length, phase]);

  function startNewChat() {
    window.localStorage.removeItem(STORAGE_KEY);
    setConversationId(null);
    setTitle(null);
    setMessages([]);
    setPhase("idle");
    setError("");
  }

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || phase === "asking") return;
    setPhase("asking");
    setError("");
    setInput("");

    const optimisticUser: ConversationMessage = {
      id: Date.now(),
      conversation_id: conversationId ?? 0,
      role: "user",
      content: trimmed,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimisticUser]);
    if (!title) setTitle(trimmed.slice(0, 60));

    try {
      let id = conversationId;
      if (id === null) {
        const created = await authFetch("/api/v1/conversations", { method: "POST", body: "{}" });
        if (!created.ok) throw new Error(`POST /api/v1/conversations returned ${created.status}`);
        id = (await created.json()).conversation_id as number;
        setConversationId(id);
        window.localStorage.setItem(STORAGE_KEY, String(id));
      }

      const response = await authFetch(`/api/v1/conversations/${id}/messages`, {
        method: "POST",
        body: JSON.stringify({ content: trimmed }),
      });
      if (!response.ok) {
        throw new Error(`POST /api/v1/conversations/${id}/messages returned ${response.status}`);
      }
      const aiMessage = (await response.json()) as ConversationMessage;
      setMessages((prev) => [...prev, aiMessage]);
      setPhase("idle");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
      setPhase("error");
    }
  }

  return (
    <RequireAuth>
      <main className="flex-1">
        <Nav />

        <section className="mx-auto max-w-3xl px-6 pb-16 pt-28">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-board text-[10px] font-semibold uppercase tracking-[0.28em] text-signal">
                Chat
              </p>
              <h1 className="mt-3 font-display text-4xl font-extrabold uppercase tracking-tight sm:text-5xl">
                {title ?? "New conversation"}
              </h1>
            </div>
            <button
              type="button"
              onClick={startNewChat}
              className="mt-1 shrink-0 rounded-full border border-line px-4 py-2 font-board text-[10px] font-semibold uppercase tracking-[0.14em] text-paper/70 transition hover:border-signal/40 hover:text-signal"
            >
              New chat
            </button>
          </div>

          <div className="mt-10 space-y-4">
            {messages.map((m) => (
              <article
                key={m.id}
                className={`rounded-xl border px-6 py-5 ${
                  m.role === "user"
                    ? "ml-auto max-w-[85%] border-signal/30 bg-signal/10"
                    : "border-line bg-panel/50"
                }`}
              >
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-paper/90">
                  {m.content}
                </p>
                <p className="mt-2 font-board text-[10px] tracking-[0.1em] text-mist">
                  {formatTime(m.created_at)}
                </p>
              </article>
            ))}

            {phase === "asking" && (
              <article className="rounded-xl border border-line bg-panel/50 px-6 py-5">
                <p className="text-sm text-mist">
                  KelanaAI is typing
                  <span className="animate-pulse">…</span>
                </p>
              </article>
            )}

            {phase === "error" && (
              <div className="rounded-xl border border-signal/40 bg-signal/10 px-6 py-6">
                <p className="font-display text-lg font-semibold text-signal">
                  Couldn&apos;t reach the chat
                </p>
                <p className="mt-2 text-sm leading-relaxed text-paper/80">
                  {error}. Check that FastAPI is running on{" "}
                  <code className="font-board text-signal">{API_BASE}</code>.
                </p>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          <form
            className="mt-10"
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
          >
            <div className="flex gap-3">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send(input);
                  }
                }}
                rows={2}
                placeholder="Plan a family trip to Japan…"
                className="w-full resize-none rounded-xl border border-line bg-panel/70 px-4 py-3 text-sm text-paper placeholder:text-mist/60 focus:border-signal/50 focus:outline-none"
              />
              <button
                type="submit"
                disabled={phase === "asking" || !input.trim()}
                className="shrink-0 rounded-lg bg-signal px-5 py-2.5 font-board text-[12px] font-semibold uppercase tracking-[0.16em] text-ink transition hover:bg-signal/85 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Send
              </button>
            </div>
          </form>
        </section>
      </main>
    </RequireAuth>
  );
}
