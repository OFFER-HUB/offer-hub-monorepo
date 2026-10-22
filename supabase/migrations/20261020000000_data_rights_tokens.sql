-- Single-use, time-limited confirmation tokens for GDPR export/delete requests.
-- Only the SHA-256 hash of a token is stored. RLS is enabled with no policies,
-- so the table is reachable only through the service role key used server-side.
create table if not exists data_rights_tokens (
  id uuid primary key default gen_random_uuid(),
  token_hash text not null unique,
  email text not null,
  action text not null check (action in ('export', 'delete')),
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);

alter table data_rights_tokens enable row level security;
