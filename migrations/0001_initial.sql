CREATE TABLE IF NOT EXISTS progress (
  koan_id TEXT PRIMARY KEY,
  completed INTEGER NOT NULL DEFAULT 0,
  completed_at TEXT
);

CREATE TABLE IF NOT EXISTS submission_attempts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  koan_id TEXT NOT NULL,
  passed INTEGER NOT NULL,
  created_at TEXT NOT NULL
);
