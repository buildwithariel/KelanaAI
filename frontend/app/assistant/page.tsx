"use client";

import { useEffect, useRef, useState } from "react";
import Nav from "../../components/Nav";
import RequireAuth from "../RequireAuth";
import { authFetch } from "../lib/auth";
import { API_BASE } from "../lib/api";
import type { AssistantAnswer } from "../lib/types";

type Phase = "idle" | "asking" | "done" | "error";

type ChatMessage = {
  id: number;
  role: "user" | "assistant";
  text: string;
  ts: number;
  sources?: string[];
  grounded?: boolean;
};

const SAMPLE_QUESTIONS = [
  "What documents do I need for a short-term visa to Japan?",
  "How do I prove I can pay for my trip to Japan?",
  "Do I need travel insurance for Japan?",
];

function formatTime(ts: number) {
  return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function TravelAssistant() {
  const [question, setQuestion] = useState("");
  const [phase, setPhase] = useState<Phase>("idle");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [error, setError] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to the latest message: covers both first-open (mount) and
  // every new message, since this effect re-runs whenever the list grows.
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [messages.length, phase]);

  async function ask(q: string) {
    const trimmed = q.trim();
    if (!trimmed || phase === "asking") return;
    setPhase("asking");
    setError("");
    setMessages((prev) => [
      ...prev,
      { id: Date.now(), role: "user", text: trimmed, ts: Date.now() },
    ]);
    try {
      const response = await authFetch("/api/v1/assistant", {
        method: "POST",
        body: JSON.stringify({ question: trimmed }),
      });
      if (!response.ok) {
        throw new Error(`POST /api/v1/assistant returned ${response.status}`);
      }
      const result = (await response.json()) as AssistantAnswer;
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: "assistant",
          text: result.answer,
          ts: Date.now(),
          sources: result.sources,
          grounded: result.grounded,
        },
      ]);
      setPhase("done");
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
          <p className="font-board text-[10px] font-semibold uppercase tracking-[0.28em] text-signal">
            Travel assistant
          </p>
          <h1 className="mt-3 font-display text-4xl font-extrabold uppercase tracking-tight sm:text-5xl">
            Ask KelanaAI
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-mist">
            Answers are grounded in KelanaAI&apos;s trusted travel documents, not
            just the model&apos;s general knowledge.
          </p>

          <form
            className="mt-10"
            onSubmit={(e) => {
              e.preventDefault();
              ask(question);
            }}
          >
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              rows={3}
              placeholder="Do Indonesian passport holders need a visa to visit Japan?"
              className="w-full resize-none rounded-xl border border-line bg-panel/70 px-4 py-3 text-sm text-paper placeholder:text-mist/60 focus:border-signal/50 focus:outline-none"
            />
            <div className="mt-4 flex items-center justify-between gap-4">
              <div className="flex flex-wrap gap-2">
                {SAMPLE_QUESTIONS.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => {
                      setQuestion(q);
                      ask(q);
                    }}
                    className="rounded-full border border-line px-3 py-1.5 text-left font-board text-[10px] uppercase tracking-[0.12em] text-paper/70 transition hover:border-signal/40 hover:text-signal"
                  >
                    {q.length > 42 ? `${q.slice(0, 42)}…` : q}
                  </button>
                ))}
              </div>
              <button
                type="submit"
                disabled={phase === "asking" || !question.trim()}
                className="shrink-0 rounded-lg bg-signal px-5 py-2.5 font-board text-[12px] font-semibold uppercase tracking-[0.16em] text-ink transition hover:bg-signal/85 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {phase === "asking" ? "Asking" : "Ask"}
              </button>
            </div>
          </form>

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
                {m.role === "assistant" && (
                  <p className="font-board text-[10px] font-semibold uppercase tracking-[0.2em] text-signal">
                    {m.grounded ? "Grounded answer" : "No matching documents"}
                  </p>
                )}
                <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-paper/90">
                  {m.text}
                </p>

                {m.sources && m.sources.length > 0 && (
                  <div className="mt-5 border-t border-line/60 pt-4">
                    <p className="font-board text-[10px] font-semibold uppercase tracking-[0.2em] text-mist">
                      Source{m.sources.length > 1 ? "s" : ""}
                    </p>
                    <ul className="mt-2 space-y-1">
                      {m.sources.map((s) => (
                        <li
                          key={s}
                          className="font-board text-xs tracking-[0.04em] text-paper/75"
                        >
                          ▤ {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <p className="mt-2 font-board text-[10px] tracking-[0.1em] text-mist">
                  {formatTime(m.ts)}
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
                  Couldn&apos;t reach the assistant
                </p>
                <p className="mt-2 text-sm leading-relaxed text-paper/80">
                  {error}. Check that FastAPI is running on{" "}
                  <code className="font-board text-signal">{API_BASE}</code>.
                </p>
              </div>
            )}

            <div ref={bottomRef} />
          </div>
        </section>
      </main>
    </RequireAuth>
  );
}
