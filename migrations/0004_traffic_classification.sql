-- Additive migration: no guessed identities or rewrites of historical events.
ALTER TABLE events ADD COLUMN actor_type TEXT NOT NULL DEFAULT 'legacy';
ALTER TABLE events ADD COLUMN actor_name TEXT NOT NULL DEFAULT 'legacy';
ALTER TABLE events ADD COLUMN actor_purpose TEXT NOT NULL DEFAULT 'legacy';
ALTER TABLE events ADD COLUMN classification_evidence TEXT NOT NULL DEFAULT 'legacy';
ALTER TABLE events ADD COLUMN classification_version INTEGER NOT NULL DEFAULT 0;
ALTER TABLE events ADD COLUMN bot_verified INTEGER;
ALTER TABLE events ADD COLUMN signed_agent INTEGER;
ALTER TABLE events ADD COLUMN bot_score INTEGER;
ALTER TABLE events ADD COLUMN resource_type TEXT NOT NULL DEFAULT 'legacy';
ALTER TABLE events ADD COLUMN http_status INTEGER;
ALTER TABLE events ADD COLUMN http_method TEXT NOT NULL DEFAULT 'OTHER';
CREATE INDEX IF NOT EXISTS events_actor_time ON events(actor_type, occurred_at);
CREATE INDEX IF NOT EXISTS events_request_time ON events(event, http_method, occurred_at);
