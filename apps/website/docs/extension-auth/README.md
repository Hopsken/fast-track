# Extension Auth + Subscription Entitlements (One-time Code via Supabase DB)

## Context
We want the browser extension to:
- link to a logged-in website user
- fetch the user subscription state (source of truth: `billing_subscriptions`)
- unlock Pro features and show account info inside the extension
- **auto-refresh** subscription state reliably

Key constraint:
- Do **not** rely on the website's Supabase auth cookies being sent from the extension (`chrome-extension://` -> `https://teamusement.com`) because SameSite / 3rd-party cookie rules are not reliable across browsers.

Therefore:
- Website uses Supabase Auth cookies only for the *linking step*.
- Extension uses **our own** access/refresh tokens (Bearer) for ongoing sync.

## High-level architecture
### Source of truth
- Billing subscription status is persisted by LemonSqueezy webhooks into Supabase table `public.billing_subscriptions`.
- Pro determination uses `isProFromSubscription()`.

### Token strategy
- Extension never receives Supabase tokens.
- Extension receives:
  - `extension_access_token` (JWT) — **24h** TTL
  - `extension_refresh_token` (JWT) — long TTL (e.g. 180d)

### Link strategy (strict one-time)
- Website issues a **one-time link code** stored in Supabase DB.
- Extension exchanges `code -> (accessToken, refreshToken, profile, subscription)`.

Why DB-backed codes:
- strict one-time semantics (replay-resistant)
- predictable behavior across browsers
- easy to migrate later to Upstash/Redis with the same interface

## Parameters (current decisions)
- Link code TTL: **5 minutes**
- Access token TTL: **24 hours**

## Data model
Apply: `./supabase.sql`

Tables:
- `public.extension_link_codes` — server-only storage for one-time codes

Notes:
- Store only `code_hash`, never the raw code.
- RLS enabled, **no policies** (deny by default). Only service role (admin client) can access.

## Endpoints
All endpoints are hosted on the website domain (`https://teamusement.com`).

### 1) Create link code
`POST /api/extension/link-code`

Auth:
- Supabase Auth cookies (website login)

Request:
- JSON: `{ "extensionId": "<required>" }`
  - The code is bound to that extension ID.

Response (200):
```json
{
  "code": "ft_link_...",
  "expiresAt": "2026-02-23T12:34:56.000Z"
}
```

Errors:
- `401` if not logged in

Security:
- Recommended: validate `Origin` / `Referer` is the website origin to reduce CSRF issuance.

### 2) Exchange code for extension tokens
`POST /api/extension/token`

Auth:
- none (code is the credential)

Request:
```json
{
  "code": "ft_link_...",
  "extensionId": "<required>" 
}
```

Server behavior:
- hash the code (`sha256`) and **atomically consume** it:
  - must exist
  - `consumed_at is null`
  - `expires_at > now()`
  - `extension_id = :extensionId`
- on success:
  - read `billing_subscriptions` for the user
  - compute `isPro`
  - issue `accessToken` (24h) and `refreshToken` (e.g. 180d)

Response (200):
```json
{
  "accessToken": "...",
  "refreshToken": "...",
  "user": { "id": "...", "email": "..." },
  "subscription": {
    "status": "active",
    "renewsAt": "...",
    "endsAt": null,
    "updatedAt": "..."
  },
  "isPro": true
}
```

Errors:
- `400` invalid/expired/consumed code

### 3) Refresh access token
`POST /api/extension/token/refresh`

Request:
```json
{ "refreshToken": "..." }
```

Response (200):
```json
{ "accessToken": "..." }
```

Errors:
- `401` invalid/expired refresh token

### 4) Fetch profile + subscription snapshot
`GET /api/extension/me`

Headers:
- `Authorization: Bearer <accessToken>`

Response (200):
```json
{
  "user": { "id": "...", "email": "..." },
  "subscription": {
    "status": "active",
    "renewsAt": "...",
    "endsAt": null,
    "updatedAt": "..."
  },
  "isPro": true,
  "checkedAt": "2026-02-23T12:34:56.000Z"
}
```

Errors:
- `401` invalid/expired access token

## Website linking page
Add a dedicated linking page that runs on the website origin so it can reliably use Supabase cookies.

Recommended URL:
- `GET /auth/extension?extension_id=<id>`

Behavior:
- If not logged in: redirect to `/login?next=/auth/extension?extension_id=...`
- If logged in:
  - call `POST /api/extension/link-code` (pass `extensionId`)
  - dispatch the code to the extension via a DOM-to-content-script bridge.

Bridge options:
- `CustomEvent` (matches the existing Jira OAuth callback bridge)
- or `window.postMessage`

Example event contract (CustomEvent):
- event name: `ft-extension-link-code`
- payload:
```ts
{ code: string, expiresAt: string, extensionId: string }
```

## Extension integration
### Storage
Store the following in extension storage:
- `ExtensionAuth`
  - `accessToken`
  - `refreshToken`
  - `user` { id, email }
- `SubscriptionSnapshot`
  - `status`, `renewsAt`, `endsAt`, `isPro`, `lastCheckedAt`

### Auto-refresh
Use extension background `alarms`:
- periodic job (e.g. every 15–30 min):
  - call `/api/extension/me`
  - if 401: call `/api/extension/token/refresh` and retry

UI refresh:
- on opening popup/options, if stale (>5min), trigger a sync.

### Upgrade flow
When the user clicks "Upgrade":
- open website checkout entrypoint (`/api/billing/checkout`) instead of a raw LemonSqueezy link.
- reason: website appends `checkout[custom][supabase_user_id]` so webhooks can map the subscription to the user.

## Testing
### Website (vitest)
- `POST /api/extension/link-code`
  - 401 when not logged in
  - returns code + expiresAt when logged in
  - inserts row with `code_hash`, `expires_at`, `consumed_at=null`
- `POST /api/extension/token`
  - invalid/expired/consumed code => 400
  - atomic consume: two concurrent exchanges -> only one succeeds
- `GET /api/extension/me`
  - 401 for invalid token
  - returns correct `isPro` for representative subscription statuses

### Extension (vitest)
- link flow: receives code -> exchanges -> storage populated
- refresh flow: `/me` 401 -> refresh -> retry succeeds

## Migration path (future)
Abstract the code store behind an interface:
- `createCode(userId, extensionId, ttl)`
- `consumeCode(code, extensionId) -> userId | null`

Phase 1: Supabase table (this doc)
Phase 2: Upstash Redis
- `SET code_hash userId NX PX ttl`
- consume via `GETDEL` or Lua for atomicity

## Open questions
- refresh token TTL (suggest 90–180 days)
- do we rotate refresh tokens on refresh? (optional)
- do we want revoke/device management later? (out of scope for v1)
