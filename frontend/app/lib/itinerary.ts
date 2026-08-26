// Bedrock returns markdown shaped by TRAVEL_PLANNER_PROMPT:
//   ## Day 1: Tokyo   ->   ### Morning   ->   - **Place**: what you do there
// This pulls out that shape so the itinerary can render as cards instead of a
// wall of text. Anything it cannot recognise is left to the raw-text fallback.

export type Item = { name: string; detail: string };
export type Slot = { label: string; items: Item[] };
export type Day = { title: string; slots: Slot[] };

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
