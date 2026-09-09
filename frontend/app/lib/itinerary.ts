// Bedrock returns markdown shaped by TRAVEL_PLANNER_PROMPT:
//   ## Day 1: Tokyo   ->   ### Morning   ->   - **Place**: what you do there
// This pulls out that shape so the itinerary can render as cards instead of a
// wall of text. Anything it cannot recognise is left to the raw-text fallback.

import type { TripProposal } from "./types";

export type Item = { name: string; detail: string };
export type Slot = { label: string; items: Item[] };
export type Day = { title: string; slots: Slot[] };

// The assistant closes a concrete plan with a trailing fenced block:
//   ```trip
//   {"destination": "Bali", "days": 5, "budget": 1500, "travel_style": "Solo"}
//   ```
// Pull it out so the chat can show a "save as trip" card instead of raw JSON.
// Anything malformed leaves the text untouched and yields no proposal.
const TRIP_BLOCK = /\n?```trip\s*\n([\s\S]*?)\n```\s*$/;

export function parseTripProposal(markdown: string): {
  proposal: TripProposal | null;
  cleaned: string;
} {
  const match = markdown.match(TRIP_BLOCK);
  if (!match) return { proposal: null, cleaned: markdown };

  try {
    const raw = JSON.parse(match[1]) as Record<string, unknown>;
    const { destination, days, budget, travel_style } = raw;
    if (
      typeof destination !== "string" ||
      typeof days !== "number" ||
      typeof budget !== "number" ||
      typeof travel_style !== "string" ||
      !destination.trim() ||
      !travel_style.trim()
    ) {
      return { proposal: null, cleaned: markdown };
    }
    return {
      proposal: { destination: destination.trim(), days, budget, travel_style: travel_style.trim() },
      cleaned: markdown.slice(0, match.index).trimEnd(),
    };
  } catch {
    return { proposal: null, cleaned: markdown };
  }
}

const DAY = /^#{1,6}\s*(Day\s*\d+.*?)\s*$/i;
const SLOT = /^(?:#{1,6}\s*)?\*{0,2}(Morning|Afternoon|Evening)\*{0,2}\s*:?\s*$/i;
const BULLET = /^[-*]\s+(.*)$/;
const NAMED = /^\*\*(.+?)\*\*\s*:?\s*(.*)$/;

const clean = (s: string) => s.replace(/\*\*/g, "").replace(/\s+/g, " ").trim();

export function parseItinerary(markdown: string): Day[] {
  const days: Day[] = [];
  let day: Day | undefined;
  let slot: Slot | undefined;

  for (const raw of markdown.split("\n")) {
    const line = raw.trim();

    const dayHit = line.match(DAY);
    if (dayHit) {
      day = { title: clean(dayHit[1]), slots: [] };
      days.push(day);
      slot = undefined;
      continue;
    }
    if (!day) continue;

    const slotHit = line.match(SLOT);
    if (slotHit) {
      slot = { label: clean(slotHit[1]), items: [] };
      day.slots.push(slot);
      continue;
    }

    const bullet = line.match(BULLET);
    if (!bullet || !slot) continue;

    const named = bullet[1].match(NAMED);
    slot.items.push(
      named
        ? { name: clean(named[1]), detail: clean(named[2]) }
        : { name: "", detail: clean(bullet[1]) },
    );
  }

  return days.filter((d) => d.slots.some((s) => s.items.length > 0));
}
