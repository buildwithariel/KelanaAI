"use client";

import Link from "next/link";
import { useState } from "react";
import { createTripFromProposal } from "../app/lib/trips";
import type { TripProposal } from "../app/lib/types";

type State =
  | { phase: "idle" }
  | { phase: "saving" }
  | { phase: "saved"; id: number }
  | { phase: "error"; message: string };

export default function TripProposalCard({ proposal }: { proposal: TripProposal }) {
  const [state, setState] = useState<State>({ phase: "idle" });

  async function save() {
    setState({ phase: "saving" });
    try {
      const trip = await createTripFromProposal(proposal);
      setState({ phase: "saved", id: trip.id });
    } catch (cause) {
      setState({
        phase: "error",
        message: cause instanceof Error ? cause.message : String(cause),
      });
    }
  }

  const summary = `${proposal.destination} · ${proposal.days} ${
    proposal.days === 1 ? "day" : "days"
  } · USD ${proposal.budget.toLocaleString("en-US")} · ${proposal.travel_style}`;

  return (
    <div className="mt-3 rounded-xl border border-signal/30 bg-signal/5 px-5 py-4">
      <p className="font-board text-[10px] font-semibold uppercase tracking-[0.2em] text-signal">
        Trip ready to save
      </p>
      <p className="mt-1 font-display text-lg font-semibold tracking-tight text-paper">
        {summary}
      </p>

      {state.phase === "saved" ? (
        <Link
          href={`/trips/${state.id}`}
          className="mt-3 inline-block rounded-lg border border-signal/50 px-4 py-2 font-board text-[11px] font-semibold uppercase tracking-[0.16em] text-signal transition hover:bg-signal hover:text-ink"
        >
          Saved · View trip →
        </Link>
      ) : (
        <button
          type="button"
          onClick={save}
          disabled={state.phase === "saving"}
          className="mt-3 rounded-lg bg-signal px-4 py-2 font-board text-[11px] font-semibold uppercase tracking-[0.16em] text-ink transition hover:bg-signal/85 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {state.phase === "saving" ? "Saving…" : "Save as trip"}
        </button>
      )}

      {state.phase === "error" && (
        <p className="mt-2 text-xs leading-relaxed text-signal">
          Couldn&apos;t save: {state.message}
        </p>
      )}
    </div>
  );
}
