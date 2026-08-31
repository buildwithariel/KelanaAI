"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Field, { control } from "../../components/Field";
import Nav from "../../components/Nav";
import { useAuth } from "../AuthProvider";

export default function LoginPage() {
  const { user, status, login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (status === "ready" && user) router.replace("/");
  }, [status, user, router]);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      await login(email, password);
      router.push("/");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="flex-1">
      <Nav />

      <section className="mx-auto flex max-w-md flex-col px-6 pb-20 pt-40">
        <p className="font-board text-[10px] font-semibold uppercase tracking-[0.28em] text-signal">
          Welcome back
        </p>
        <h1 className="mt-3 font-display text-4xl font-extrabold uppercase tracking-tight">
          Log in
        </h1>

        <form
          onSubmit={onSubmit}
          className="mt-8 flex flex-col gap-5 rounded-2xl bg-paper p-7 text-ink shadow-2xl shadow-black/50 sm:p-9"
        >
          <Field id="email" label="Email">
            <input
              id="email"
              type="email"
              className={control}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </Field>

          <Field id="password" label="Password">
            <input
              id="password"
              type="password"
              className={control}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </Field>

          {error && (
            <p className="rounded-lg border border-signal/40 bg-signal/10 px-4 py-3 text-sm text-signal">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="inline-flex items-center justify-center gap-3 rounded-lg bg-ink px-7 py-4 font-board text-[13px] font-semibold uppercase tracking-[0.16em] text-paper transition hover:bg-ink/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal focus-visible:ring-offset-2 focus-visible:ring-offset-paper disabled:cursor-not-allowed disabled:opacity-40"
          >
            {busy ? "Logging in" : "Log in"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-paper/70">
          New to KelanaAI?{" "}
          <Link href="/register" className="text-signal hover:underline">
            Register
          </Link>
        </p>
      </section>
    </main>
  );
}
