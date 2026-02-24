# Billing (LemonSqueezy)

## Overview
- Users authenticate via Supabase Auth.
- Checkout is hosted by LemonSqueezy.
- Webhooks are the source of truth for subscription status.

## Setup
1. Apply the SQL schema:
   - `docs/billing/supabase.sql`
2. Set env vars (see `apps/website/.env.example`):
   - `SUPABASE_SECRET_KEY`
   - `LEMONSQUEEZY_WEBHOOK_SECRET`
   - `LEMONSQUEEZY_API_KEY` (needed to fetch signed Customer Portal URLs)
3. Configure LemonSqueezy webhook URL:
   - `{WEBSITE_URL}/api/billing/lemonsqueezy/webhook`

## Notes
- LemonSqueezy hosted checkout URLs differ between **test** and **live** mode. Configure:
  - `LEMONSQUEEZY_PRO_CHECKOUT_URL_TEST` (required for test mode)
  - `LEMONSQUEEZY_PRO_CHECKOUT_URL_LIVE` (optional override)
- We append `checkout[custom][supabase_user_id]` to the checkout URL so the webhook can map the subscription to a Supabase user.
