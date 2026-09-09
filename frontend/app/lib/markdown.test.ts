// node --test app/lib/markdown.test.ts
import assert from "node:assert/strict";
import test from "node:test";
import { parseBlocks } from "./markdown.ts";

// Verbatim shape of a real amazon.nova-lite-v1:0 chat reply.
const REPLY = `Here is a plan for your trip.

## Day 1: Tokyo

### Morning
- **Shibuya Crossing**: the world's busiest intersection.
- Meiji Shrine.

### Afternoon
1. teamLab Planets
2. Odaiba

---

Let me know if you want to adjust the budget.`;

test("splits a real reply into headings, lists and paragraphs", () => {
  const blocks = parseBlocks(REPLY);
  assert.deepEqual(blocks[0], { type: "p", text: "Here is a plan for your trip." });
  assert.deepEqual(blocks[1], { type: "heading", level: 2, text: "Day 1: Tokyo" });
  assert.deepEqual(blocks[2], { type: "heading", level: 3, text: "Morning" });
  assert.deepEqual(blocks[3], {
    type: "ul",
    items: ["**Shibuya Crossing**: the world's busiest intersection.", "Meiji Shrine."],
  });
  assert.deepEqual(blocks[5], { type: "ol", items: ["teamLab Planets", "Odaiba"] });
  assert.deepEqual(blocks[6], { type: "hr" });
  assert.equal(blocks[7].type, "p");
});

test("multi-line paragraphs join into one block", () => {
  const blocks = parseBlocks("First line\nsecond line\n\nnext para");
  assert.deepEqual(blocks, [
    { type: "p", text: "First line second line" },
    { type: "p", text: "next para" },
  ]);
});

test("plain text with no markdown is a single paragraph", () => {
  assert.deepEqual(parseBlocks("just a sentence"), [{ type: "p", text: "just a sentence" }]);
});
