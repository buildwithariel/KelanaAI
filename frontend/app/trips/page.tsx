"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Nav from "../../components/Nav";
import TripCard from "../../components/TripCard";
import { API_BASE } from "../lib/api";
import type { Trip } from "../lib/types";

type Phase = "loading" | "done" | "error";

export default function TripHistory() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [phase, setPhase] = useState<Phase>("loading");
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    fetch(`${API_BASE}/api/v1/trips`)
      .then((response) => {
        if (!response.ok) throw new Error(`GET /api/v1/trips returned ${response.status}`);
        return response.json();
      })
      .then((data: Trip[]) => {
        if (cancelled) return;
        setTrips([...data].reverse());
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

  return (
    <main className="flex-1">
      <Nav />

      <section className="mx-auto max-w-6xl px-6 pb-16 pt-28">
        <p className="font-board text-[10px] font-semibold uppercase tracking-[0.28em] text-signal">
          Trip history
        </p>
        <h1 className="mt-3 font-display text-4xl font-extrabold uppercase tracking-tight sm:text-5xl">
          Every trip you&apos;ve planned
        </h1>

        {phase === "loading" && (
          <p className="mt-14 rounded-xl border border-dashed border-line px-6 py-10 text-center font-board text-[12px] uppercase tracking-[0.2em] text-mist">
            Loading your trips
          </p>
        )}

        {phase === "error" && (
          <div className="mt-14 rounded-xl border border-signal/40 bg-signal/10 px-6 py-8">
            <p className="font-display text-xl font-semibold text-signal">
              Couldn&apos;t load your trips
            </p>
            <p className="mt-2 text-sm leading-relaxed text-paper/80">
              {error}. Check that FastAPI is running on{" "}
              <code className="font-board text-signal">{API_BASE}</code>.
            </p>
          </div>
        )}

        {phase === "done" && trips.length === 0 && (
          <div className="mt-14 rounded-xl border border-dashed border-line px-6 py-10 text-center">
            <p className="font-board text-[12px] uppercase tracking-[0.2em] text-mist">
              No trips yet
            </p>
            <Link
              href="/#plan"
              className="mt-5 inline-block rounded-lg border border-signal/50 px-5 py-2.5 font-board text-[12px] font-semibold uppercase tracking-[0.16em] text-signal transition hover:bg-signal hover:text-ink"
            >
              Plan your first trip
            </Link>
          </div>
        )}

        {phase === "done" && trips.length > 0 && (
          <div className="mt-10 grid grid-cols-1 gap-5 lg:grid-cols-2">
            {trips.map((trip) => (
              <TripCard key={trip.id} trip={trip} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
