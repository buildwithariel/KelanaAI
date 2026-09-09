-- Session 11 - store which Knowledge Base documents grounded each assistant reply.
-- Adds messages.sources (JSON array of doc names). Mirrors backend/models/conversation.py. Safe to re-run.

ALTER TABLE messages
    ADD COLUMN IF NOT EXISTS sources JSONB;
