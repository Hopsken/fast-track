# Pro unlock via Website Subscription (Extension)

This extension unlocks Pro based on the user's **website subscription**.

The source of truth is the website's Supabase table `public.billing_subscriptions` (populated by LemonSqueezy webhooks).

## Linking + tokens
The extension does not use Supabase directly.

Instead, it links a website account via a one-time code exchange:
- Extension opens `https://teamusement.com/auth/extension?extension_id=...`
- Website issues a one-time code (stored server-side)
- Extension exchanges the code for `accessToken` (24h) + `refreshToken`
- Extension periodically calls `/api/extension/me` to refresh `SubscriptionSnapshot`

Authoritative spec:
- See `apps/website/docs/extension-auth/README.md`
