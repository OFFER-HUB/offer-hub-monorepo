-- SQL migration: create contact_inquiries table for OFFER-HUB
-- Run this in your Supabase SQL editor or via psql/supabase CLI

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS contact_inquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company text NOT NULL,
  contact_name text NOT NULL,
  email text NOT NULL,
  message text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Optional: index on email for lookups
CREATE INDEX IF NOT EXISTS idx_contact_inquiries_email ON contact_inquiries (email);
