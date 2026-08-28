"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, type ReactNode } from "react";
import { API_BASE } from "./lib/api";
import { parseItinerary } from "./lib/itinerary";
import type { Trip } from "./lib/types";

type Phase = "idle" | "saving" | "writing" | "done" | "error";

// Same destination keys the backend recommends places for, so the photo at the
// top always matches the trip the API is about to plan.
const HEROES: Record<string, { src: string; alt: string }> = {
  japan: { src: "photo-1493976040374-85c8e12f0c0e", alt: "Yasaka Pagoda above the Higashiyama rooftops in Kyoto at dusk" },
  indonesia: { src: "photo-1537996194471-e657df975ab4", alt: "Ulun Danu Beratan temple reflected in a still lake in Bali" },
  singapore: { src: "photo-1565967511849-76a60a516170", alt: "Marina Bay Sands and the Merlion lit up at night" },
  thailand: { src: "photo-1552465011-b4e21bf6e79a", alt: "Longtail boats moored on a limestone-backed beach in Krabi" },
  korea: { src: "photo-1538485399081-7191377e8241", alt: "Neon shopfront signs stacked along a Seoul side street at night" },
  malaysia: { src: "photo-1506929562872-bb421503ef21", alt: "Turquoise bay with small boats seen from above" },
  france: { src: "photo-1502602898657-3e91760cbb34", alt: "The Eiffel Tower across the Seine at dawn" },
  usa: { src: "photo-1485871981521-5b1fd3805eee", alt: "The Manhattan skyline at sunset" },
  "": { src: "photo-1500835556837-99ac94a94552", alt: "An aircraft wing above a floor of cloud at dusk" },
};

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const STYLES = ["Family", "Solo", "Couple"];

const control =
  "h-12 w-full rounded-lg border border-ink/15 bg-white px-3.5 text-[15px] text-ink outline-none transition placeholder:text-ink/35 focus-visible:border-ink/40 focus-visible:ring-2 focus-visible:ring-signal";

export default function Home() {
  const [form, setForm] = useState({
    destination: "",
    days: "5",
    budget: "2000",
    travel_month: "December",
    travel_style: "Solo",
  });
  const [phase, setPhase] = useState<Phase>("idle");
  const [error, setError] = useState("");
  const [trip, setTrip] = useState<Trip | null>(null);

  const set = (key: keyof typeof form) => (value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  const destination = form.destination.trim();
  const hero = HEROES[destination.toLowerCase()] ?? HEROES[""];
  const busy = phase === "saving" || phase === "writing";

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setTrip(null);
    setPhase("saving");
    try {
      const created: Trip = await post("/api/v1/trips", {
        destination,
        days: Number(form.days),
        budget: Number(form.budget),
        currency: "USD",
        travel_month: form.travel_month,
        travel_style: form.travel_style,
      });
      setPhase("writing");
      setTrip(await post(`/api/v1/trips/${created.id}/generate`));
      setPhase("done");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
      setPhase("error");
    }
  }

  const days = parseItinerary(trip?.ai_recommendation ?? "");

  return (
    <main className="flex-1">
      {/* ---------------------------------------------------------------- hero */}
      <section className="relative isolate flex min-h-[80svh] items-end overflow-hidden">
        <Image
          key={hero.src}
          src={`https://images.unsplash.com/${hero.src}?auto=format&fit=crop&w=1920&q=70`}
          alt={hero.alt}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-t from-night via-night/90 to-night/30" />

        <header className="absolute inset-x-0 top-0 z-10">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-6">
            <p className="font-display text-lg font-extrabold tracking-tight">
              Kelana<span className="text-signal">AI</span>
            </p>
            <Link
              href="/trips"
              className="font-board text-[10px] font-semibold uppercase tracking-[0.24em] text-mist transition hover:text-signal"
            >
              Trip history
            </Link>
          </div>
        </header>

        <div className="relative mx-auto w-full max-w-6xl px-6 pb-36 pt-28">
          <p className="font-board text-[10px] font-semibold uppercase tracking-[0.28em] text-signal">
            Next trip
          </p>

          <h1 className="mt-6 font-display text-[clamp(3rem,13vw,7.5rem)] font-extrabold uppercase leading-[0.85] tracking-[-0.03em]">
            {destination || "Anywhere"}
          </h1>

          <p className="mt-6 max-w-lg text-base leading-relaxed text-paper/75 sm:text-lg">
            Name a place and a budget. You get back a day-by-day plan — morning,
            afternoon and evening — with real venues, not filler.
          </p>

          <dl className="mt-10 grid max-w-3xl grid-cols-2 gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-4">
            <Board label="Destination" value={destination.toUpperCase() || "—"} />
            <Board label="Days" value={form.days || "—"} />
            <Board label="Budget" value={form.budget ? `USD ${Number(form.budget).toLocaleString("en-US")}` : "—"} />
            <Board label="Style" value={form.travel_style.toUpperCase()} />
          </dl>
        </div>
      </section>

      {/* ------------------------------------------------------ boarding pass */}
      <section id="plan" className="scroll-mt-8 bg-night px-6 pb-20">
        <form
          onSubmit={onSubmit}
          className="relative mx-auto -mt-16 max-w-3xl rounded-2xl bg-paper text-ink shadow-2xl shadow-black/50"
        >
          <div className="p-7 sm:p-9">
            <div className="flex items-baseline justify-between gap-4">
              <h2 className="font-display text-2xl font-extrabold uppercase tracking-tight">
                Trip details
              </h2>
              <span className="font-board text-[10px] uppercase tracking-[0.2em] text-ink/40">
                Kelana / 001
              </span>
            </div>

            <div className="mt-7 grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Field id="destination" label="Destination">
                  <input
                    id="destination"
                    className={control}
                    value={form.destination}
                    onChange={(e) => set("destination")(e.target.value)}
                    placeholder="Japan, Indonesia, Thailand…"
                    required
                  />
                </Field>
              </div>

              <Field id="days" label="Days">
                <input
                  id="days"
                  className={control}
                  type="number"
                  min={1}
                  max={60}
                  value={form.days}
                  onChange={(e) => set("days")(e.target.value)}
                  required
                />
              </Field>

              <Field id="budget" label="Budget (USD)">
                <input
                  id="budget"
                  className={control}
                  type="number"
                  min={50}
                  step={50}
                  value={form.budget}
                  onChange={(e) => set("budget")(e.target.value)}
                  required
                />
              </Field>

              <Field id="travel_month" label="Travel month">
                <select
                  id="travel_month"
                  className={control}
                  value={form.travel_month}
                  onChange={(e) => set("travel_month")(e.target.value)}
                >
                  {MONTHS.map((m) => (
                    <option key={m}>{m}</option>
                  ))}
                </select>
              </Field>

              <Field id="travel_style" label="Travel style">
                <select
                  id="travel_style"
                  className={control}
                  value={form.travel_style}
                  onChange={(e) => set("travel_style")(e.target.value)}
                >
                  {STYLES.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </Field>
            </div>
          </div>

          <div className="tear" />

          <div className="flex flex-col gap-5 p-7 sm:flex-row sm:items-center sm:justify-between sm:p-9">
            <p className="font-board text-[11px] uppercase leading-relaxed tracking-[0.14em] text-ink/45">
              Saved to your trips,
              <br className="hidden sm:block" /> then written by Amazon Bedrock.
            </p>
            <button
              type="submit"
              disabled={busy || !destination}
              className="inline-flex items-center justify-center gap-3 rounded-lg bg-ink px-7 py-4 font-board text-[13px] font-semibold uppercase tracking-[0.16em] text-paper transition hover:bg-ink/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal focus-visible:ring-offset-2 focus-visible:ring-offset-paper disabled:cursor-not-allowed disabled:opacity-40"
            >
              {busy && (
                <span
                  aria-hidden
                  className="size-4 animate-spin rounded-full border-2 border-paper/30 border-t-signal"
                />
              )}
              {busy ? "Working" : "Generate itinerary"}
            </button>
          </div>
        </form>
      </section>

      {/* -------------------------------------------------------------- result */}
      <section className="mx-auto max-w-6xl px-6 pb-24" aria-live="polite">
        {phase === "idle" && (
          <p className="rounded-xl border border-dashed border-line px-6 py-10 text-center font-board text-[12px] uppercase tracking-[0.2em] text-mist">
            Your itinerary lands here
          </p>
        )}

        {busy && (
          <div className="rounded-xl border border-line bg-panel/50 px-6 py-10 text-center">
            <p className="font-display text-xl font-semibold">
              {phase === "saving" ? "Saving your trip" : "Writing your itinerary"}
            </p>
            <p className="mt-2 font-board text-[12px] uppercase tracking-[0.18em] text-mist">
              {phase === "saving"
                ? "Filing it with the API"
                : "Amazon Bedrock is thinking — about ten seconds"}
            </p>
          </div>
        )}

        {phase === "error" && (
          <div className="rounded-xl border border-signal/40 bg-signal/10 px-6 py-8">
            <p className="font-display text-xl font-semibold text-signal">
              The planner didn&apos;t answer
            </p>
            <p className="mt-2 text-sm leading-relaxed text-paper/80">
              {error}. Check that FastAPI is running on{" "}
              <code className="font-board text-signal">{API_BASE}</code>, then
              try again.
            </p>
            <a
              href="#plan"
              className="mt-5 inline-block rounded-lg border border-signal/50 px-5 py-2.5 font-board text-[12px] font-semibold uppercase tracking-[0.16em] text-signal transition hover:bg-signal hover:text-ink"
            >
              Back to the form
            </a>
          </div>
        )}

        {phase === "done" && trip && (
          <>
            <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-line bg-line lg:grid-cols-4">
              <Board label="Season" value={trip.travel_season} />
              <Board label="Budget class" value={trip.category} />
              <Board label="Per day" value={`USD ${trip.daily_budget.toLocaleString("en-US")}`} />
              <Board label="Getting around" value={trip.reccomendation_transport} />
            </dl>

            <h2 className="mt-14 font-display text-3xl font-extrabold uppercase tracking-tight sm:text-4xl">
              {trip.days} days in {trip.destination}
            </h2>

            {days.length > 0 ? (
              <div className="mt-8 grid grid-cols-1 gap-5 lg:grid-cols-2">
                {days.map((day) => (
                  <article
                    key={day.title}
                    className="rounded-xl border border-line bg-panel/50 p-6 sm:p-7"
                  >
                    <h3 className="font-display text-xl font-semibold tracking-tight">
                      {day.title}
                    </h3>
                    {day.slots.map((slot) => (
                      <div key={slot.label} className="mt-6">
                        <p className="font-board text-[10px] font-semibold uppercase tracking-[0.22em] text-signal">
                          {slot.label}
                        </p>
                        <ul className="mt-3 space-y-2.5">
                          {slot.items.map((item, i) => (
                            <li
                              key={i}
                              className="border-l border-line pl-4 text-sm leading-relaxed text-paper/75"
                            >
                              {item.name && (
                                <span className="font-semibold text-paper">
                                  {item.name}.{" "}
                                </span>
                              )}
                              {item.detail}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </article>
                ))}
              </div>
            ) : (
              <pre className="mt-8 overflow-x-auto whitespace-pre-wrap rounded-xl border border-line bg-panel/50 p-6 font-sans text-sm leading-relaxed text-paper/80">
                {trip.ai_recommendation}
              </pre>
            )}
          </>
        )}
      </section>
    </main>
  );
}

async function post(path: string, body?: unknown) {
  const response = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!response.ok) throw new Error(`POST ${path} returned ${response.status}`);
  return response.json();
}

function Board({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-deep/80 px-4 py-3.5">
      <dt className="font-board text-[10px] font-semibold uppercase tracking-[0.2em] text-mist">
        {label}
      </dt>
      <dd className="mt-1 truncate font-board text-lg font-semibold tabular-nums text-signal">
        {value}
      </dd>
    </div>
  );
}

function Field({
  id,
  label,
  children,
}: {
  id: string;
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label
        htmlFor={id}
        className="font-board text-[10px] font-semibold uppercase tracking-[0.18em] text-ink/55"
      >
        {label}
      </label>
      {children}
    </div>
  );
}
