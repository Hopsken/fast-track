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
   - `LEMONSQUEEZY_PRO_CHECKOUT_URL`
   - `LEMONSQUEEZY_WEBHOOK_SECRET`
3. Configure LemonSqueezy webhook URL:
   - `{WEBSITE_URL}/api/billing/lemonsqueezy/webhook`

## Notes
- `LEMONSQUEEZY_PRO_CHECKOUT_URL` should point to the annual Pro checkout ($29/year).
- We append `checkout[custom][supabase_user_id]` to the checkout URL so the webhook can map the subscription to a Supabase user.
