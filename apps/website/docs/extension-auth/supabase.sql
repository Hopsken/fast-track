-- Extension linking auth: one-time codes
--
-- Run this in Supabase SQL Editor.

create table if not exists public.extension_link_codes (
  code_hash text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  extension_id text,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  consumed_at timestamptz
);

create index if not exists extension_link_codes_expires_at_idx
  on public.extension_link_codes (expires_at);

alter table public.extension_link_codes enable row level security;

-- Server-only table. Deny all by default (no policies).
