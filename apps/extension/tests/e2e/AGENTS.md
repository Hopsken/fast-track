# E2E Testing Guide (Playwright + MV3 Extension)

This folder contains Playwright end-to-end tests for the **MV3 Chrome extension** (built with **WXT**).

The key differences from “normal” web-app E2E testing:

- The extension runs in a **Chromium persistent context** with an **MV3 background service worker**.
- Jira API calls are executed in the **background service worker** via `jira.js`.
- `jira.js` uses **axios**, so mocking `fetch()` is **not** sufficient.

---

## Quick start

From repo root:

```bash
pnpm -C apps/extension test:e2e
```

Run only one project:

```bash
pnpm -C apps/extension exec playwright test --config=playwright.config.ts --project=popup
pnpm -C apps/extension exec playwright test --config=playwright.config.ts --project=options
```

Run a single spec:

```bash
pnpm -C apps/extension exec playwright test --config=playwright.config.ts tests/e2e/popup/suggestions-api.spec.ts
```

---

## How the extension is launched

Fixture: `tests/e2e/fixtures/extension.ts`

- Uses `chromium.launchPersistentContext(userDataDir, { args: [--load-extension=...] })`
- Waits for the MV3 **service worker** to appear to compute the `extensionId`
- Provides helpers:
  - `openExtensionPage('popup.html' | 'options.html' | ...)`
  - `openAuthenticatedPopup()` (sets `AuthCredentials` in `chrome.storage.local` first)

### Important: test isolation

A persistent context can leak state if it reuses the same user data directory.

This repo’s fixture creates a **unique temp userDataDir per test** and deletes it after the test.

That means:
- `chrome.storage.local` starts empty per test
- React Query persisted cache starts empty per test

---

## Build step (globalSetup)

Global setup: `tests/e2e/global-setup.ts`

Before running tests, we build the extension:

- `pnpm exec turbo run build`
- Ensures `.output/chromium-mv3/manifest.json` exists

### E2E-only Jira API mocking is enabled at build time

During the e2e build, we set:

- `VITE_E2E_MOCKS=1`

This allows bundling test-only mocking code into the extension **without affecting normal builds**.

Note: Turbo only forwards env vars listed in `turbo.json`. We added `VITE_E2E_MOCKS` to `extension#build.env`.

---

## API mocking strategy (MV3 + jira.js)

### Why not MSW/`fetch`-mocking?

- MV3 background requests originate from the **extension service worker**.
- `jira.js` uses **axios** internally (not `fetch`).

So:
- Playwright `context.route(...)` is not reliable for MV3 SW API calls.
- Patching `globalThis.fetch` does **not** intercept `jira.js` traffic.

### Recommended approach: axios adapter (mock at transport layer)

File: `src/lib/jira/e2e/axios-mocks.ts`

We create an **axios adapter** that returns fixture responses for Jira REST endpoints.

Injection point:

- `src/lib/jira/api.ts` → `buildClientConfig()`
- When `VITE_E2E_MOCKS === '1'`, we pass:
  - `baseRequestConfig: { adapter: createJiraE2EMockAdapter() }`

This is the most reliable way to mock Jira APIs for MV3 background execution.

### Adding new Jira mocks

Edit:

- `apps/extension/src/lib/jira/e2e/axios-mocks.ts`

Add a new branch matching:
- HTTP method (`config.method`)
- `URL(config.url, config.baseURL).pathname`
- optional body (`config.data`) / params

Return an `AxiosResponse` with `{ status, data }`.

Tip: keep mocks **fail-fast** (`501`) for unknown endpoints to avoid accidentally hitting the real network.

---

## Two useful test patterns

### Pattern A: UI-only deterministic tests (seed React Query cache)

Example: `tests/e2e/popup/suggestions.spec.ts`

- Write `REACT_QUERY_OFFLINE_CACHE` into `chrome.storage.local`
- Open popup and assert UI renders cached data

Use this when you want fast UI tests without exercising background network behavior.

### Pattern B: “Real flow” tests (background calls mocked Jira via axios adapter)

Example: `tests/e2e/popup/suggestions-api.spec.ts`

- Set `AuthCredentials`
- Ensure `REACT_QUERY_OFFLINE_CACHE` is removed
- Open popup
- Background fetches Jira suggestions; axios adapter returns fixtures

Use this when you want to validate cross-context wiring:
UI → proxy service → background → jira.js → mocked Jira response → UI render

---

## Common pitfalls

1) **Clearing storage too aggressively**
   - Some pages run migrations / initialization. Prefer setting only what you need.

2) **React Query persisted cache hiding network bugs**
   - If you want to force a fresh fetch, remove `REACT_QUERY_OFFLINE_CACHE`.

3) **Turbo env vars not applied**
   - If a mock depends on `VITE_*`, ensure it is listed under `extension#build.env` in `turbo.json`.

---

## Where to put new tests

- Popup tests: `tests/e2e/popup/*.spec.ts`
- Options tests: `tests/e2e/options/*.spec.ts`

Config: `playwright.config.ts`
- projects: `popup`, `options`

---
