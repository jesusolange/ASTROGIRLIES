-- Cloudflare D1 schema. Apply with: npx wrangler d1 execute astromed --file=schema.sql --remote
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE
);
CREATE TABLE IF NOT EXISTS login_tokens (
  hash TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL,
  used INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS login_tokens_email ON login_tokens (email, created_at);
CREATE TABLE IF NOT EXISTS sessions (
  hash TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users (id),
  email TEXT NOT NULL,
  expires_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS snapshots (
  user_id INTEGER PRIMARY KEY REFERENCES users (id),
  data TEXT NOT NULL,
  updated_at INTEGER NOT NULL
);
