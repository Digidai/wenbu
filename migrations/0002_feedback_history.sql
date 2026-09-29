ALTER TABLE events ADD COLUMN received_at INTEGER NOT NULL DEFAULT 0;
ALTER TABLE events ADD COLUMN client_at INTEGER;
ALTER TABLE events ADD COLUMN page_id TEXT;
ALTER TABLE events ADD COLUMN operation_id TEXT;
ALTER TABLE events ADD COLUMN parent_operation_id TEXT;
ALTER TABLE events ADD COLUMN conversation_id TEXT;
ALTER TABLE events ADD COLUMN sequence INTEGER;
ALTER TABLE events ADD COLUMN schema_version INTEGER NOT NULL DEFAULT 1;
ALTER TABLE events ADD COLUMN release TEXT NOT NULL DEFAULT 'legacy';
ALTER TABLE events ADD COLUMN destination_page TEXT NOT NULL DEFAULT '/other/';
ALTER TABLE events ADD COLUMN setting TEXT NOT NULL DEFAULT 'none';
ALTER TABLE events ADD COLUMN variant TEXT NOT NULL DEFAULT 'none';
ALTER TABLE events ADD COLUMN archive_key TEXT;
UPDATE events SET received_at = occurred_at WHERE received_at = 0;
CREATE INDEX events_operation ON events(operation_id, occurred_at, id);
CREATE INDEX events_conversation ON events(conversation_id, occurred_at, id);
CREATE INDEX events_history ON events(occurred_at DESC, id DESC);
CREATE INDEX events_unarchived ON events(received_at, id) WHERE archive_key IS NULL;

CREATE TABLE feedback (
  id TEXT PRIMARY KEY,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  revision INTEGER NOT NULL DEFAULT 1,
  state TEXT NOT NULL DEFAULT 'new',
  category TEXT NOT NULL,
  rating TEXT NOT NULL,
  message TEXT NOT NULL,
  contact TEXT NOT NULL DEFAULT '',
  context_excerpt TEXT NOT NULL DEFAULT '',
  share_context INTEGER NOT NULL DEFAULT 0,
  payload_hash TEXT NOT NULL,
  page TEXT NOT NULL,
  locale TEXT NOT NULL,
  tool TEXT NOT NULL,
  session_id TEXT,
  visitor_id TEXT,
  operation_id TEXT,
  conversation_id TEXT,
  release TEXT NOT NULL,
  is_test INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX feedback_history ON feedback(created_at DESC, id DESC);
CREATE INDEX feedback_state ON feedback(state, created_at DESC);
CREATE INDEX feedback_operation ON feedback(operation_id);

CREATE TABLE analytics_archives (
  key TEXT PRIMARY KEY,
  created_at INTEGER NOT NULL,
  first_received_at INTEGER NOT NULL,
  last_received_at INTEGER NOT NULL,
  event_count INTEGER NOT NULL,
  byte_count INTEGER NOT NULL,
  sha256 TEXT NOT NULL
);
CREATE INDEX archive_history ON analytics_archives(created_at DESC, key DESC);
CREATE TABLE analytics_maintenance (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  last_attempt INTEGER NOT NULL,
  last_success INTEGER,
  status TEXT NOT NULL,
  archived_events INTEGER NOT NULL DEFAULT 0,
  lease_owner TEXT,
  lease_until INTEGER NOT NULL DEFAULT 0
);
