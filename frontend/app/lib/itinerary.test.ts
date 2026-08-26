// node --test app/lib/itinerary.test.ts
import assert from "node:assert/strict";
import test from "node:test";
import { parseItinerary } from "./itinerary.ts";

// Verbatim slice of real amazon.nova-lite-v1:0 output for a 3-day Japan trip.
const REAL = `# 3-Day Luxury Itinerary in Japan

## Day 1: Tokyo

### Morning
- **Shibuya Crossing**: Experience the world's busiest pedestrian crossing.
- **Imperial Palace East Gardens**: Stroll through the beautiful gardens.

### Afternoon
- **Tokyo National Museum**: Explore Japan's rich history and culture.

### Evening
- **Dinner**: Enjoy a kaiseki meal at **Sukiyabashi Jiro** (reservation required).

---

## Day 2: Kyoto

### Morning
- **Fushimi Inari Taisha**: Walk through the iconic torii gates.
`;

test("pulls day / slot / item structure out of real model output", () => {
  const days = parseItinerary(REAL);

  assert.equal(days.length, 2);
  assert.equal(days[0].title, "Day 1: Tokyo");
  assert.deepEqual(
    days[0].slots.map((s) => s.label),
    ["Morning", "Afternoon", "Evening"],
  );
  assert.equal(days[0].slots[0].items[0].name, "Shibuya Crossing");
  assert.equal(
    days[0].slots[0].items[0].detail,
    "Experience the world's busiest pedestrian crossing.",
  );
  // inline bold inside a detail must not leak asterisks into the UI
  assert.equal(
    days[0].slots[2].items[0].detail,
    "Enjoy a kaiseki meal at Sukiyabashi Jiro (reservation required).",
  );
  assert.equal(days[1].title, "Day 2: Kyoto");
});

test("bullets without a bolded name still render", () => {
  const days = parseItinerary("## Day 1\n### Morning\n- Walk the old town.\n");
  assert.deepEqual(days[0].slots[0].items, [
    { name: "", detail: "Walk the old town." },
  ]);
});

test("unrecognised text yields no days so the UI falls back to raw markdown", () => {
  assert.deepEqual(parseItinerary("Just a paragraph, no headings."), []);
  assert.deepEqual(parseItinerary("## Day 1: Tokyo\n\nNo bullets here."), []);
});
