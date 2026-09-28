CREATE TABLE IF NOT EXISTS events (
  id TEXT PRIMARY KEY, occurred_at INTEGER NOT NULL,
  event TEXT NOT NULL, origin TEXT NOT NULL,
  session_id TEXT, visitor_id TEXT,
  page TEXT NOT NULL, entry_page TEXT NOT NULL,
  locale TEXT NOT NULL, source TEXT NOT NULL, medium TEXT NOT NULL, campaign TEXT NOT NULL,
  device TEXT NOT NULL, browser TEXT NOT NULL, os TEXT NOT NULL, country TEXT NOT NULL,
  channel TEXT NOT NULL, tool TEXT NOT NULL, mode TEXT NOT NULL, action TEXT NOT NULL, status TEXT NOT NULL,
  value INTEGER NOT NULL DEFAULT 0, duration_ms INTEGER NOT NULL DEFAULT 0,
  model_calls INTEGER NOT NULL DEFAULT 0, tool_calls INTEGER NOT NULL DEFAULT 0,
  artifacts INTEGER NOT NULL DEFAULT 0, is_test INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS events_time ON events(occurred_at);
CREATE INDEX IF NOT EXISTS events_event_time ON events(event, occurred_at);
CREATE INDEX IF NOT EXISTS events_session ON events(session_id, occurred_at);
