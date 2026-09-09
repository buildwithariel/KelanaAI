"use client";

import { useEffect, useRef, useState } from "react";
import Nav from "../../components/Nav";
import RequireAuth from "../RequireAuth";
import ChatSidebar from "../../components/ChatSidebar";
import TripProposalCard from "../../components/TripProposalCard";
import Markdown from "../../components/Markdown";
import { authFetch } from "../lib/auth";
import { API_BASE } from "../lib/api";
import { parseTripProposal } from "../lib/itinerary";
import type { ConversationMessage, ConversationSummary } from "../lib/types";

type Phase = "idle" | "asking" | "error";

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        } catch {
          /* clipboard blocked (non-secure context) — selection still works */
        }
      }}
      className="font-board text-[10px] font-semibold uppercase tracking-[0.14em] text-mist transition hover:text-signal"
    >
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

const STORAGE_KEY = "kelana_chat_conversation_id";

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function ChatPage() {
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [title, setTitle] = useState<string | null>(null);
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [input, setInput] = useState("");
  const [phase, setPhase] = useState<Phase>("idle");
  const [error, setError] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Sidebar list of every past conversation (backend returns them newest-first).
  useEffect(() => {
    authFetch("/api/v1/conversations")
      .then((res) => (res.ok ? res.json() : []))
      .then((rows: ConversationSummary[]) => setConversations(rows))
      .catch(() => {});
  }, []);

  // Resume the last-opened conversation on first load (if any).
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
    // Only resets the view — past conversations stay in the DB and the sidebar.
    window.localStorage.removeItem(STORAGE_KEY);
    setConversationId(null);
    setTitle(null);
    setMessages([]);
    setPhase("idle");
    setError("");
    setDrawerOpen(false);
  }

  function openConversation(id: number) {
    setDrawerOpen(false);
    if (id === conversationId) return;
    setPhase("idle");
    setError("");
    authFetch(`/api/v1/conversations/${id}/messages`)
      .then((res) => (res.ok ? res.json() : Promise.reject(res)))
      .then((rows: ConversationMessage[]) => {
        setConversationId(id);
        setMessages(rows);
        setTitle(rows[0]?.content.slice(0, 60) ?? null);
        window.localStorage.setItem(STORAGE_KEY, String(id));
      })
      .catch(() => {
        setError("Couldn't load that conversation.");
        setPhase("error");
      });
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
        const newId = (await created.json()).conversation_id as number;
        id = newId;
        setConversationId(newId);
        window.localStorage.setItem(STORAGE_KEY, String(newId));
        setConversations((prev) => [
          { id: newId, title: trimmed.slice(0, 60), created_at: new Date().toISOString() },
          ...prev,
        ]);
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

  const sidebarProps = {
    conversations,
    activeId: conversationId,
    onSelect: openConversation,
    onNewChat: startNewChat,
  };

  return (
    <RequireAuth>
      <main className="flex-1">
        <Nav />

        <div className="mx-auto flex w-full max-w-6xl gap-6 px-4 pt-24 sm:px-6">
          <ChatSidebar
            {...sidebarProps}
            className="sticky top-24 hidden h-[calc(100vh-7rem)] md:flex"
          />

          {drawerOpen && (
            <div className="fixed inset-0 z-30 md:hidden">
              <button
                type="button"
                aria-label="Close conversations"
                onClick={() => setDrawerOpen(false)}
                className="absolute inset-0 bg-black/60"
              />
              <div className="absolute left-0 top-0 flex h-full w-72 flex-col border-r border-line bg-deep p-4 pt-24">
                <ChatSidebar {...sidebarProps} className="h-full w-full" />
              </div>
            </div>
          )}

          <section className="min-w-0 flex-1 pb-16">
            <div className="mx-auto max-w-3xl">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setDrawerOpen(true)}
                  className="rounded-full border border-line px-3 py-1.5 font-board text-[10px] font-semibold uppercase tracking-[0.14em] text-paper/70 transition hover:border-signal/40 hover:text-signal md:hidden"
                >
                  Chats
                </button>
                <p className="font-board text-[10px] font-semibold uppercase tracking-[0.28em] text-signal">
                  Assistant
                </p>
              </div>
              <h1 className="mt-3 truncate font-display text-3xl font-extrabold uppercase tracking-tight sm:text-4xl">
                {title ?? "New conversation"}
              </h1>

              <div className="mt-10 space-y-4">
                {messages.map((m) => {
                  const { proposal, cleaned } =
                    m.role === "assistant"
                      ? parseTripProposal(m.content)
                      : { proposal: null, cleaned: m.content };
                  return (
                    <article
                      key={m.id}
                      className={`rounded-xl border px-6 py-5 ${
                        m.role === "user"
                          ? "ml-auto max-w-[85%] border-signal/30 bg-signal/10"
                          : "border-line bg-panel/50"
                      }`}
                    >
                      {m.role === "assistant" ? (
                        <Markdown>{cleaned}</Markdown>
                      ) : (
                        <p className="whitespace-pre-wrap text-sm leading-relaxed text-paper/90">
                          {cleaned}
                        </p>
                      )}

                      {proposal && <TripProposalCard proposal={proposal} />}

                      {m.sources && m.sources.length > 0 && (
                        <div className="mt-4 border-t border-line/60 pt-3">
                          <p className="font-board text-[10px] font-semibold uppercase tracking-[0.2em] text-mist">
                            Source{m.sources.length > 1 ? "s" : ""}
                          </p>
                          <ul className="mt-1.5 space-y-1">
                            {m.sources.map((s) => (
                              <li key={s} className="font-board text-xs tracking-[0.04em] text-paper/70">
                                &#9636; {s}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <div className="mt-2 flex items-center gap-4">
                        <p className="font-board text-[10px] tracking-[0.1em] text-mist">
                          {formatTime(m.created_at)}
                        </p>
                        {m.role === "assistant" && <CopyButton text={cleaned} />}
                      </div>
                    </article>
                  );
                })}

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
            </div>
          </section>
        </div>
      </main>
    </RequireAuth>
  );
}
