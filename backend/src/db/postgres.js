const { Pool } = require('pg');

const pool = new Pool({
  host:     'localhost',
  port:     5433,
  user:     'admin',
  password: 'password',
  database: 'meetingdb',
});

async function init() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS meetings (
      id          TEXT PRIMARY KEY,
      title       TEXT NOT NULL,
      filename    TEXT,
      duration    INTEGER,
      status      TEXT DEFAULT 'pending',
      created_at  TIMESTAMPTZ DEFAULT NOW(),
      updated_at  TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS transcripts (
      id          TEXT PRIMARY KEY,
      meeting_id  TEXT REFERENCES meetings(id) ON DELETE CASCADE,
      content     TEXT,
      segments    JSONB,
      created_at  TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS analysis (
      id           TEXT PRIMARY KEY,
      meeting_id   TEXT REFERENCES meetings(id) ON DELETE CASCADE,
      summary      TEXT,
      action_items JSONB,
      decisions    JSONB,
      sentiment    JSONB,
      created_at   TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS action_items (
      id          TEXT PRIMARY KEY,
      meeting_id  TEXT REFERENCES meetings(id) ON DELETE CASCADE,
      task        TEXT NOT NULL,
      owner       TEXT,
      deadline    TEXT,
      status      TEXT DEFAULT 'open',
      created_at  TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS meetings_status_idx     ON meetings(status);
    CREATE INDEX IF NOT EXISTS action_items_meeting_idx ON action_items(meeting_id);
  `);
  console.log('✅ PostgreSQL ready — all tables created');
}

module.exports = { pool, init };