PRAGMA foreign_keys = ON;
CREATE TABLE IF NOT EXISTS mm_acompanhamentos (
 id TEXT PRIMARY KEY, company TEXT NOT NULL, title TEXT NOT NULL,
 responsible TEXT NOT NULL, status TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS mm_feedback_links (
 id TEXT PRIMARY KEY,
 acompanhamento_id TEXT NOT NULL REFERENCES mm_acompanhamentos(id),
 token_hash TEXT NOT NULL UNIQUE,
 created_at INTEGER NOT NULL,
 expires_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_mm_links_acompanhamento ON mm_feedback_links(acompanhamento_id, created_at);
CREATE TABLE IF NOT EXISTS mm_feedback_respostas (
 id TEXT PRIMARY KEY,
 link_id TEXT NOT NULL UNIQUE REFERENCES mm_feedback_links(id),
 name TEXT NOT NULL,
 feedback_type TEXT NOT NULL CHECK (feedback_type IN ('treinamento','produtos')),
 answers_json TEXT NOT NULL,
 created_at INTEGER NOT NULL
);
