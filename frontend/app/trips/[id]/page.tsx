"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Board from "../../../components/Board";
import ItineraryDays from "../../../components/ItineraryDays";
import Nav from "../../../components/Nav";
import { API_BASE } from "../../lib/api";
import { parseItinerary } from "../../lib/itinerary";
import type { Trip } from "../../lib/types";

type Phase = "loading" | "done" | "error" | "not-found";

export default function TripDetail() {
  const { id } = useParams<{ id: string }>();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [phase, setPhase] = useState<Phase>("loading");
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    fetch(`${API_BASE}/api/v1/trips/${id}`)
      .then((response) => {
        if (response.status === 404) throw new Error("not-found");
        if (!response.ok) throw new Error(`GET /api/v1/trips/${id} returned ${response.status}`);
        return response.json();
      })
      .then((data: Trip) => {
        if (cancelled) return;
        setTrip(data);
        setPhase("done");
      })
      .catch((cause) => {
        if (cancelled) return;
        if (cause instanceof Error && cause.message === "not-found") {
          setPhase("not-found");
        } else {
          setError(cause instanceof Error ? cause.message : String(cause));
          setPhase("error");
        }
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  const days = parseItinerary(trip?.ai_recommendation ?? "");

  return (
    <main className="flex-1">
      <Nav />

      <section className="mx-auto max-w-6xl px-6 pb-16 pt-28">
        <Link
          href="/trips"
          className="font-board text-[11px] font-semibold uppercase tracking-[0.16em] text-mist transition hover:text-signal"
        >
          ← All trips
        </Link>

        {phase === "loading" && (
          <p className="mt-8 rounded-xl border border-dashed border-line px-6 py-10 text-center font-board text-[12px] uppercase tracking-[0.2em] text-mist">
            Loading trip
          </p>
        )}

        {phase === "not-found" && (
          <div className="mt-8 rounded-xl border border-dashed border-line px-6 py-10 text-center">
            <p className="font-board text-[12px] uppercase tracking-[0.2em] text-mist">
              This trip doesn&apos;t exist
            </p>
            <Link
              href="/trips"
              className="mt-5 inline-block rounded-lg border border-signal/50 px-5 py-2.5 font-board text-[12px] font-semibold uppercase tracking-[0.16em] text-signal transition hover:bg-signal hover:text-ink"
            >
              Back to trip history
            </Link>
          </div>
        )}

        {phase === "error" && (
          <div className="mt-8 rounded-xl border border-signal/40 bg-signal/10 px-6 py-8">
            <p className="font-display text-xl font-semibold text-signal">
              Couldn&apos;t load this trip
            </p>
            <p className="mt-2 text-sm leading-relaxed text-paper/80">
              {error}. Check that FastAPI is running on{" "}
              <code className="font-board text-signal">{API_BASE}</code>.
            </p>
          </div>
        )}

        {phase === "done" && trip && (
          <>
            <p className="mt-8 font-board text-[10px] font-semibold uppercase tracking-[0.28em] text-signal">
              {trip.category}
              {trip.travel_style ? ` · ${trip.travel_style}` : ""}
            </p>
            <h1 className="mt-3 font-display text-4xl font-extrabold uppercase tracking-tight sm:text-5xl">
              {trip.days} days in {trip.destination}
            </h1>

            <dl className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-line bg-line lg:grid-cols-4">
              <Board label="Season" value={trip.travel_season} />
              <Board label="Budget" value={`USD ${trip.budget.toLocaleString("en-US")}`} />
              <Board label="Per day" value={`USD ${trip.daily_budget.toLocaleString("en-US")}`} />
              <Board label="Getting around" value={trip.reccomendation_transport} />
            </dl>

            {trip.ai_recommendation ? (
              <ItineraryDays days={days} raw={trip.ai_recommendation} />
            ) : (
              <p className="mt-8 rounded-xl border border-dashed border-line px-6 py-10 text-center font-board text-[12px] uppercase tracking-[0.2em] text-mist">
                No itinerary generated for this trip yet
              </p>
            )}
          </>
        )}
      </section>
    </main>
  );
}
