// node --test app/lib/itinerary.test.ts
import assert from "node:assert/strict";
import test from "node:test";
import { parseItinerary, parseTripProposal } from "./itinerary.ts";

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

test("parseTripProposal pulls the trailing trip block and strips it from the text", () => {
  const md =
    "Here is your plan for Bali.\n\n" +
    '```trip\n{"destination": "Bali", "days": 5, "budget": 1500, "travel_style": "Solo"}\n```';
  const { proposal, cleaned } = parseTripProposal(md);
  assert.deepEqual(proposal, {
    destination: "Bali",
    days: 5,
    budget: 1500,
    travel_style: "Solo",
  });
  assert.equal(cleaned, "Here is your plan for Bali.");
});

test("parseTripProposal returns no proposal when there is no block", () => {
  assert.deepEqual(parseTripProposal("Just chatting, no plan yet."), {
    proposal: null,
    cleaned: "Just chatting, no plan yet.",
  });
});

test("parseTripProposal rejects a malformed or incomplete block, leaving text intact", () => {
  const bad = 'Plan:\n```trip\n{"destination": "Bali", "days": "five"}\n```';
  assert.deepEqual(parseTripProposal(bad), { proposal: null, cleaned: bad });

  const notJson = "Plan:\n```trip\nnot json at all\n```";
  assert.deepEqual(parseTripProposal(notJson), { proposal: null, cleaned: notJson });
});

test("parseTripProposal only matches a block at the very end of the message", () => {
  const midText =
    '```trip\n{"destination": "Bali", "days": 5, "budget": 1500, "travel_style": "Solo"}\n```\n\nAnything after.';
  assert.deepEqual(parseTripProposal(midText), { proposal: null, cleaned: midText });
});

test("parseTripProposal rejects non-positive or non-integer days and budget", () => {
  const cases = [
    '{"destination": "Bali", "days": 0, "budget": 1500, "travel_style": "Solo"}',
    '{"destination": "Bali", "days": -3, "budget": 1500, "travel_style": "Solo"}',
    '{"destination": "Bali", "days": 5.5, "budget": 1500, "travel_style": "Solo"}',
    '{"destination": "Bali", "days": 5, "budget": 0, "travel_style": "Solo"}',
    '{"destination": "Bali", "days": 5, "budget": -100, "travel_style": "Solo"}',
    '{"destination": "  ", "days": 5, "budget": 1500, "travel_style": "Solo"}',
    '{"destination": "Bali", "days": 5, "budget": 1500, "travel_style": ""}',
  ];
  for (const body of cases) {
    const md = `Plan:\n\`\`\`trip\n${body}\n\`\`\``;
    assert.equal(parseTripProposal(md).proposal, null, body);
  }
});

test("parseTripProposal tolerates extra whitespace and a float-but-integer day", () => {
  const md =
    'Plan.\n\n```trip  \n  {"destination": " Bali ", "days": 7.0, "budget": 2000, "travel_style": " Couple "}  \n```  ';
  assert.deepEqual(parseTripProposal(md).proposal, {
    destination: "Bali",
    days: 7,
    budget: 2000,
    travel_style: "Couple",
  });
});

test("parseItinerary handles CRLF, level-6 headings and asterisk bullets", () => {
  const md = "###### Day 1: Osaka\r\n### Morning\r\n* Dotonbori.\r\n* Osaka Castle.\r\n";
  const days = parseItinerary(md);
  assert.equal(days.length, 1);
  assert.equal(days[0].title, "Day 1: Osaka");
  assert.deepEqual(days[0].slots[0].items.map((i) => i.detail), ["Dotonbori.", "Osaka Castle."]);
});

test("parseItinerary ignores slots and bullets that appear before any day", () => {
  assert.deepEqual(parseItinerary("### Morning\n- Something\n\n## Not a day heading"), []);
});
