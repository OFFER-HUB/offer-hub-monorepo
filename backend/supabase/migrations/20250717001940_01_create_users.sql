CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address TEXT UNIQUE NOT NULL,
  email TEXT,
  username TEXT UNIQUE NOT NULL,
  name TEXT,
  bio TEXT,
  is_freelancer BOOLEAN DEFAULT false,
  reputation_score INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  last_login_at TIMESTAMP
);

ALTER TABLE users ADD COLUMN IF NOT EXISTS nonce TEXT;