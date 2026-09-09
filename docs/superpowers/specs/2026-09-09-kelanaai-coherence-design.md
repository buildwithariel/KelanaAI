# KelanaAI Coherence - Design

_2026-09-09_

## Problem

KelanaAI is a set of bootcamp-session features bolted together, not one product:

- **Two chat-like pages with different backends.** `/assistant` does RAG (grounded
  in the Bedrock Knowledge Base, cites sources) but has no memory. `/chat` has
  memory (sends full history to Bedrock) but no grounding. Users can't tell them
  apart.
- **No bridge from conversation to trip.** The assistant can describe an
  itinerary, but the only way to get a saved `Trip` is to retype everything into
  the `/` form.
- **`/` is a planning form, not a dashboard.** After login there is no overview -
  just a big hero and a form. `/trips` is a flat list.
- **UI is inconsistent.** Every page re-implements its own loading / empty / error
  states and header markup.

## Goals

1. One chat experience: conversation memory **and** KB grounding with sources.
2. From an assistant recommendation, a one-click "save as trip" that creates the
   `Trip` row and its itinerary without retyping.
3. `/` becomes a dashboard: stats, recent trips, entry points.
4. A shared component layer so every page's header / states look the same. The
   existing visual identity (dark "night" palette, boarding-pass motif, uppercase
   mono labels, `signal` accent) is kept and systematized, not replaced.

## Non-goals

Server-side pagination for `/trips` (client-side is fine at this scale), token
streaming in chat, editing/deleting conversations, Bedrock tool-calling.

## Approach

**Extend the existing conversation flow** rather than add a tool-calling loop or
keep two backends.

`send_message()` becomes the single path: retrieve KB passages for each user
turn, pass them to Bedrock via the Converse `system` field alongside the full
message history, persist the assistant reply with its sources. The trip proposal
is prompt-driven - the model ends a planning reply with a fenced ```trip block;
the frontend parses it, hides the raw block, and renders a save-action card that
reuses the existing `POST /trips` + `POST /trips/{id}/generate` endpoints.

Rejected alternatives:

- **Tool/function calling** (`toolConfig` with `create_trip` / `search_docs`):
  more robust proposal parsing and retrieval-on-demand, but a large backend
  change (tool loop, `tool_use`/`tool_result` message turns) and Nova Lite's
  tool-use reliability is marginal. Overkill here.
- **Keep two backends + a "generate trip from transcript" bridge**: leaves the
  two-chat-pages confusion in place, which is the thing users complained about.

## Backend changes

### `services/bedrock_service.py`

`ask_conversation(messages, context: str | None = None)` - when `context` is
provided, pass it as the Converse `system` parameter:
`system=[{"text": context}]`. Everything else unchanged. `get_ai_recommendation`,
`ask_base_model`, `TRAVEL_PLANNER_PROMPT` untouched.

### `services/conversation_service.py`

New module constant `CONVERSATION_SYSTEM` - the grounding rules plus the trip
block contract:

> You are KelanaAI's travel assistant. Use the CONTEXT passages below when they
> are relevant; if they don't cover the question, answer from general knowledge
> and say so. When the traveller has given you enough to plan a concrete trip -
> a destination, a trip length in days, a total budget in USD, and a travel style
> - end your reply with a fenced block, nothing after it:
>
> ```trip
> {"destination": "<city or country>", "days": <int>, "budget": <number>, "travel_style": "<Solo|Couple|Family|...>"}
> ```
>
> Only include the block when all four fields are known. Never show the block's
> contents as prose.

`send_message(db, conversation, content)`:

1. Save the user `Message`.
2. `passages = safe_retrieve(content)` - wraps `kb_service.retrieve_passages`;
   on any exception (missing `KNOWLEDGE_BASE_ID`, KB down) returns `[]` and logs.
   Chat must not fail because retrieval failed.
3. `context = CONVERSATION_SYSTEM` + rendered passages (or just
   `CONVERSATION_SYSTEM` when `passages == []`).
4. `answer = ask_conversation(history, context)` where `history` is the full
   stored thread.
5. Save the assistant `Message` with `sources = distinct passage source names`
   (`[]` when ungrounded).
6. Return the assistant `Message`.

### `models/conversation.py`

`Message.sources = Column(JSON, nullable=True)` (SQLAlchemy `JSON` type).

### `migrations/003_add_sources_to_messages.sql`

```sql
ALTER TABLE messages ADD COLUMN IF NOT EXISTS sources JSONB;
```

Same "safe to re-run" style as 001 / 002.

### `main.py`

- Delete the `/api/v1/assistant` and `/api/v1/ask` routes, the `QuestionRequest`
  model, and the `ask_knowledge_base` import.
- `POST /conversations/{id}/messages` and `GET /conversations/{id}/messages`
  responses carry `sources` automatically (ORM serialization).

### Not touched

`scripts/rag_compare.py` imports `ask_base_model` and `ask_knowledge_base` from
the services directly, not via routes - it keeps working.

## Frontend changes

### Information architecture

| Route | After |
|---|---|
| `/` | **Dashboard.** Stats row (total trips, last destination, total budget), the 3 most recent trips as cards, primary CTA -> `/chat`, secondary CTA -> `/plan`. Stats derived client-side from `GET /api/v1/trips`. |
| `/plan` | The current `/` planning form, moved verbatim, using shared components. |
| `/chat` | The single assistant. Adds source rendering under assistant messages and the trip-proposal card. Keeps the localStorage conversation-resume. |
| `/assistant` | `redirect("/chat")`. |
| `/trips`, `/trips/[id]`, `/profile`, `/login`, `/register` | Unchanged behavior; adopt shared components. |

`components/Nav.tsx` - logged-in links become `Home . Assistant . Trips .
Profile` ("Assistant" -> `/chat`, "Trip history" -> "Trips").

### Chat -> card flow

1. User: "5 days in Bali, $1500, solo".
2. Backend retrieves KB context, calls Bedrock with `system` + history, the reply
   ends with `` ```trip {"destination":"bali","days":5,"budget":1500,"travel_style":"Solo"} ``.
3. `parseTripProposal(content)` splits `{ proposal, cleaned }`. The bubble shows
   `cleaned`; below it a `<TripProposalCard>`: `Bali . 5 days . $1500 . Solo
   [Save as trip]`.
4. Click -> `createTripFromProposal(proposal)` -> `POST /trips` -> `POST
   /trips/{id}/generate`. On success the card becomes `Saved . View trip ->`
   linking `/trips/{id}`. On failure, an inline error on the card; no trip
   created.

The chat itinerary is a preview; the saved card's `ai_recommendation` is the
canonical `/generate` output that `parseItinerary` already understands.

### lib

- `lib/types.ts`: `ConversationMessage.sources?: string[] | null`; new
  `TripProposal = { destination: string; days: number; budget: number;
  travel_style: string }`.
- `lib/itinerary.ts`: `parseTripProposal(markdown): { proposal: TripProposal |
  null; cleaned: string }`. Recognizes a single trailing ` ```trip ` fenced
  block, `JSON.parse`s it, validates the four fields and their types; on any
  miss returns `{ proposal: null, cleaned: markdown }`.
- `lib/api.ts`: `createTripFromProposal(p: TripProposal): Promise<Trip>` - the
  two-step POST currently inline in `app/page.tsx`, extracted so the form and the
  chat card share it.

### Shared components (`frontend/components/`, flat, matching current layout)

`Button`, `Card`, `Badge`, `EmptyState`, `Spinner`, `PageHeader`, `Stat`.
Existing `Board`, `Field`, `TripCard`, `Nav`, `ItineraryDays` stay where they
are; pages migrate to the new primitives for headers and states. Tailwind theme
tokens in `globals.css` are unchanged. What gets systematized: one type scale,
one spacing rhythm, one page shell (eyebrow + title via `PageHeader`), one
loading/empty/error treatment. The `frontend-design` skill guides this pass.

## Data model

`messages.sources` - nullable JSON array of strings (document names). `null` for
rows written before this change; `[]` for an ungrounded reply; `["a.pdf",
"b.md"]` when grounded.

## Error handling

| Failure | Behavior |
|---|---|
| KB retrieval throws in `send_message` | Log, treat as no passages, reply ungrounded with `sources = []`. Chat still responds. |
| `parseTripProposal` can't parse a block | Return `proposal: null`; the raw text (including the block, if the model malformed it) renders as-is. No card. |
| `createTripFromProposal` fails (`POST /trips` or `/generate`) | Inline error on the card, card stays in its pre-save state. |

## Testing

- `frontend/app/lib/itinerary.test.ts` - add `parseTripProposal` cases: valid
  trailing block, no block, malformed JSON, block with a missing/wrong-typed
  field. Run via the existing `npm test` (`node --test`).
- `backend/services/conversation_service.py` - a `__main__` self-check asserting
  `CONVERSATION_SYSTEM` contains the `` ```trip `` contract markers, mirroring
  the self-check pattern in `bedrock_service.py`. The DB + Bedrock path is not
  unit-tested (no mock framework in the repo - consistent with existing style).

## Build order

1. Backend: `messages.sources` column + migration + model.
2. Backend: `ask_conversation` context param; `conversation_service` grounding +
   `CONVERSATION_SYSTEM` + trip contract; delete `/assistant` routes.
3. Frontend lib: `parseTripProposal` + test, `TripProposal` type,
   `createTripFromProposal`.
4. Frontend shared components.
5. Frontend IA: `/` dashboard, `/plan`, `/assistant` redirect, `Nav`.
6. Frontend `/chat`: sources + `TripProposalCard`.
7. Design-system migration of remaining pages.
8. Verify end to end against a running dev server.
