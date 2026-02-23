-- Billing schema for LemonSqueezy subscriptions
--
-- Run this in Supabase SQL Editor.

-- 1) Subscription row per user
create table if not exists public.billing_subscriptions (
  user_id uuid primary key references auth.users(id) on delete cascade,
  lemonsqueezy_subscription_id text,
  lemonsqueezy_customer_id text,
  status text not null default 'unknown',
  renews_at timestamptz,
  ends_at timestamptz,
  customer_portal_url text,
  updated_at timestamptz not null default now()
);

-- 2) (Optional but recommended) webhook event idempotency
create table if not exists public.billing_webhook_events (
  id text primary key,
  received_at timestamptz not null default now()
);

-- Enable RLS
alter table public.billing_subscriptions enable row level security;
alter table public.billing_webhook_events enable row level security;

-- Policies: users can read their subscription
create policy "Users can read own billing subscription"
  on public.billing_subscriptions
  for select
  to authenticated
  using (user_id = auth.uid());

-- Webhook events table is server-only. Deny all by default (no policies).
