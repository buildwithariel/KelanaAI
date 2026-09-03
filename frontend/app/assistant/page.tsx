"use client";

import { useState } from "react";
import Nav from "../../components/Nav";
import RequireAuth from "../RequireAuth";
import { authFetch } from "../lib/auth";
import { API_BASE } from "../lib/api";
import type { AssistantAnswer } from "../lib/types";

type Phase = "idle" | "asking" | "done" | "error";

const SAMPLE_QUESTIONS = [
  "What documents do I need for a short-term visa to Japan?",
  "How do I prove I can pay for my trip to Japan?",
  "Do I need travel insurance for Japan?",
];

export default function TravelAssistant() {
  const [question, setQuestion] = useState("");
  const [phase, setPhase] = useState<Phase>("idle");
  const [result, setResult] = useState<AssistantAnswer | null>(null);
  const [error, setError] = useState("");

  async function ask(q: string) {
    const trimmed = q.trim();
    if (!trimmed || phase === "asking") return;
    setPhase("asking");
    setError("");
    try {
      const response = await authFetch("/api/v1/assistant", {
        method: "POST",
        body: JSON.stringify({ question: trimmed }),
      });
      if (!response.ok) {
        throw new Error(`POST /api/v1/assistant returned ${response.status}`);
      }
      setResult((await response.json()) as AssistantAnswer);
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

          {phase === "error" && (
            <div className="mt-10 rounded-xl border border-signal/40 bg-signal/10 px-6 py-6">
              <p className="font-display text-lg font-semibold text-signal">
                Couldn&apos;t reach the assistant
              </p>
              <p className="mt-2 text-sm leading-relaxed text-paper/80">
                {error}. Check that FastAPI is running on{" "}
                <code className="font-board text-signal">{API_BASE}</code>.
              </p>
            </div>
          )}

          {phase === "done" && result && (
            <article className="mt-10 rounded-xl border border-line bg-panel/50 px-6 py-6">
              <p className="font-board text-[10px] font-semibold uppercase tracking-[0.2em] text-signal">
                {result.grounded ? "Grounded answer" : "No matching documents"}
              </p>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-paper/90">
                {result.answer}
              </p>

              {result.sources.length > 0 && (
                <div className="mt-5 border-t border-line/60 pt-4">
                  <p className="font-board text-[10px] font-semibold uppercase tracking-[0.2em] text-mist">
                    Source{result.sources.length > 1 ? "s" : ""}
                  </p>
                  <ul className="mt-2 space-y-1">
                    {result.sources.map((s) => (
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
            </article>
          )}
        </section>
      </main>
    </RequireAuth>
  );
}
