-- Session 8 — link every trip to its owner.
-- Adds trips.user_id (FK -> users.id). Mirrors backend/models/trip.py. Safe to re-run.

ALTER TABLE trips
    ADD COLUMN IF NOT EXISTS user_id BIGINT REFERENCES users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS ix_trips_user_id ON trips (user_id);
