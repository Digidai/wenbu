-- Public canonical URLs only. Independent of product events and archive maintenance.
CREATE TABLE IF NOT EXISTS indexnow_state (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  lease_owner TEXT NOT NULL DEFAULT '',
  lease_until INTEGER NOT NULL DEFAULT 0,
  last_checked INTEGER,
  last_status TEXT NOT NULL DEFAULT 'never',
  last_error TEXT,
  retry_at INTEGER NOT NULL DEFAULT 0,
  failures INTEGER NOT NULL DEFAULT 0
);
INSERT OR IGNORE INTO indexnow_state (id) VALUES (1);

CREATE TABLE IF NOT EXISTS indexnow_pages (
  url TEXT PRIMARY KEY,
  content_hash TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS indexnow_submissions (
  id TEXT PRIMARY KEY,
  submitted_at INTEGER NOT NULL,
  revision TEXT NOT NULL,
  http_status INTEGER,
  outcome TEXT NOT NULL,
  url_count INTEGER NOT NULL,
  urls_json TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS indexnow_submissions_time ON indexnow_submissions(submitted_at DESC);
