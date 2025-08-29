CREATE TABLE IF NOT EXISTS refresh_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  token TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  CONSTRAINT refresh_tokens_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE
);

-- Enable pgcrypto for hashing (digest function)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Rename `token` -> `token_hash` and store as BYTEA (SHA-256)
ALTER TABLE refresh_tokens
  RENAME COLUMN token TO token_hash;

ALTER TABLE refresh_tokens
  ALTER COLUMN token_hash SET DATA TYPE BYTEA
  USING digest(token_hash, 'sha256');

-- Enforce uniqueness on hashed tokens
CREATE UNIQUE INDEX IF NOT EXISTS ux_refresh_tokens_token_hash
  ON refresh_tokens(token_hash);

-- Index for user lookups
CREATE INDEX IF NOT EXISTS ix_refresh_tokens_user_id
  ON refresh_tokens(user_id);

-- Index for cleanup (e.g. deleting expired tokens)
CREATE INDEX IF NOT EXISTS ix_refresh_tokens_created_at
  ON refresh_tokens(created_at);
