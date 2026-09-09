"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import Board from "../../components/Board";
import Nav from "../../components/Nav";
import { authFetch } from "../lib/auth";
import { useAuth } from "../AuthProvider";
import RequireAuth from "../RequireAuth";
import { API_BASE } from "../lib/api";
import type { Trip } from "../lib/types";

type Phase = "loading" | "done" | "error";

function initials(name: string | null, email: string): string {
  const source = name?.trim() || email;
  const parts = source.split(/[\s@._-]+/).filter(Boolean);
  return (parts[0]?.[0] ?? "?").concat(parts[1]?.[0] ?? "").toUpperCase();
}

function tally(values: string[]): [string, number][] {
  const counts = new Map<string, number>();
  for (const v of values) counts.set(v, (counts.get(v) ?? 0) + 1);
  return [...counts.entries()].sort((a, b) => b[1] - a[1]);
}

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [phase, setPhase] = useState<Phase>("loading");
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    authFetch("/api/v1/trips")
      .then((res) => {
        if (!res.ok) throw new Error(`GET /api/v1/trips returned ${res.status}`);
        return res.json();
      })
      .then((data: Trip[]) => {
        if (cancelled) return;
        setTrips(data);
        setPhase("done");
      })
      .catch((cause) => {
        if (cancelled) return;
        setError(cause instanceof Error ? cause.message : String(cause));
        setPhase("error");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const stats = useMemo(() => {
    const budget = trips.reduce((sum, t) => sum + t.budget, 0);
    const days = trips.reduce((sum, t) => sum + t.days, 0);
    const destinations = new Set(trips.map((t) => t.destination.trim().toLowerCase()));
    return {
      count: trips.length,
      budget,
      days,
      destinations: destinations.size,
      byCategory: tally(trips.map((t) => t.category)),
      byStyle: tally(trips.map((t) => t.travel_style).filter((s): s is string => Boolean(s))),
      recent: [...trips].sort((a, b) => b.created_at.localeCompare(a.created_at)).slice(0, 3),
    };
  }, [trips]);

  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" })
    : null;

  function onLogout() {
    logout();
    router.push("/login");
  }

  return (
    <RequireAuth>
      <main className="flex-1">
        <Nav />

        <section className="mx-auto max-w-3xl px-6 pb-20 pt-28">
          <p className="font-board text-[10px] font-semibold uppercase tracking-[0.28em] text-signal">
            Your account
          </p>
          <h1 className="mt-3 font-display text-4xl font-extrabold uppercase tracking-tight sm:text-5xl">
            Profile
          </h1>

          {/* identity */}
          <div className="mt-10 flex items-center gap-5 rounded-xl border border-line bg-panel/50 p-6">
            <div
              aria-hidden
              className="grid size-16 shrink-0 place-items-center rounded-full border border-signal/40 bg-signal/10 font-display text-xl font-extrabold text-signal"
            >
              {user ? initials(user.name, user.email) : "?"}
            </div>
            <div className="min-w-0">
              <p className="truncate font-display text-2xl font-bold tracking-tight text-paper">
                {user?.name || "Traveller"}
              </p>
              <p className="truncate text-sm text-mist">{user?.email}</p>
              {memberSince && (
                <p className="mt-1 font-board text-[10px] uppercase tracking-[0.18em] text-mist">
                  Member since {memberSince}
                </p>
              )}
            </div>
          </div>

          {phase === "loading" && (
            <p className="mt-10 rounded-xl border border-dashed border-line px-6 py-10 text-center font-board text-[12px] uppercase tracking-[0.2em] text-mist">
              Loading your travel stats
            </p>
          )}

          {phase === "error" && (
            <div className="mt-10 rounded-xl border border-signal/40 bg-signal/10 px-6 py-8">
              <p className="font-display text-lg font-semibold text-signal">
                Couldn&apos;t load your stats
              </p>
              <p className="mt-2 text-sm leading-relaxed text-paper/80">
                {error}. Check that FastAPI is running on{" "}
                <code className="font-board text-signal">{API_BASE}</code>.
              </p>
            </div>
          )}

          {phase === "done" && stats.count === 0 && (
            <div className="mt-10 rounded-xl border border-dashed border-line px-6 py-12 text-center">
              <p className="font-board text-[12px] uppercase tracking-[0.2em] text-mist">
                No trips planned yet
              </p>
              <div className="mt-5 flex flex-wrap justify-center gap-3">
                <Link
                  href="/chat"
                  className="rounded-lg bg-signal px-5 py-2.5 font-board text-[12px] font-semibold uppercase tracking-[0.16em] text-ink transition hover:bg-signal/85"
                >
                  Ask the assistant
                </Link>
                <Link
                  href="/plan"
                  className="rounded-lg border border-signal/50 px-5 py-2.5 font-board text-[12px] font-semibold uppercase tracking-[0.16em] text-signal transition hover:bg-signal hover:text-ink"
                >
                  Plan a trip
                </Link>
              </div>
            </div>
          )}

          {phase === "done" && stats.count > 0 && (
            <>
              <dl className="mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-4">
                <Board label="Trips planned" value={String(stats.count)} />
                <Board label="Budget planned" value={`USD ${stats.budget.toLocaleString("en-US")}`} />
                <Board label="Days planned" value={String(stats.days)} />
                <Board label="Destinations" value={String(stats.destinations)} />
              </dl>

              <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2">
                <Breakdown title="By budget class" rows={stats.byCategory} />
                <Breakdown title="By travel style" rows={stats.byStyle} />
              </div>

              <div className="mt-8">
                <p className="font-board text-[10px] font-semibold uppercase tracking-[0.2em] text-mist">
                  Recent trips
                </p>
                <ul className="mt-3 divide-y divide-line/60 overflow-hidden rounded-xl border border-line bg-panel/50">
                  {stats.recent.map((t) => (
                    <li key={t.id}>
                      <Link
                        href={`/trips/${t.id}`}
                        className="flex items-center justify-between gap-4 px-5 py-4 transition hover:bg-white/5"
                      >
                        <span className="min-w-0">
                          <span className="block truncate font-display text-lg font-semibold tracking-tight text-paper">
                            {t.destination}
                          </span>
                          <span className="font-board text-[10px] uppercase tracking-[0.16em] text-mist">
                            {t.days} {t.days === 1 ? "day" : "days"} · {t.category}
                          </span>
                        </span>
                        <span className="whitespace-nowrap font-board text-sm font-semibold tabular-nums text-signal">
                          USD {t.budget.toLocaleString("en-US")}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}

          <button
            type="button"
            onClick={onLogout}
            className="mt-10 rounded-full border border-signal/50 px-5 py-2.5 font-board text-[12px] font-semibold uppercase tracking-[0.16em] text-signal transition hover:bg-signal hover:text-ink"
          >
            Log out
          </button>
        </section>
      </main>
    </RequireAuth>
  );
}

function Breakdown({ title, rows }: { title: string; rows: [string, number][] }) {
  const max = Math.max(1, ...rows.map(([, n]) => n));
  return (
    <div className="rounded-xl border border-line bg-panel/50 p-6">
      <p className="font-board text-[10px] font-semibold uppercase tracking-[0.2em] text-mist">
        {title}
      </p>
      {rows.length === 0 ? (
        <p className="mt-3 text-sm text-mist">-</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {rows.map(([label, n]) => (
            <li key={label}>
              <div className="flex items-baseline justify-between font-board text-xs">
                <span className="uppercase tracking-[0.12em] text-paper/80">{label}</span>
                <span className="tabular-nums text-signal">{n}</span>
              </div>
              <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-line">
                <div className="h-full rounded-full bg-signal/70" style={{ width: `${(n / max) * 100}%` }} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
