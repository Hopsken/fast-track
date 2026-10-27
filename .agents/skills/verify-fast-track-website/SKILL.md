---
name: verify-fast-track-website
description: Run and drive the fast-track.work website (apps/website, Next.js): the landing and privacy pages and the Jira OAuth relay routes. Use it after any change to apps/website when you need a relay transcript or page screenshots as evidence. Changes to the OAuth callback page or relay contract must also run the OAuth handoff in verify-fast-track (the extension skill).
---

# Verify Fast Track website

The website serves the landing page (`/`), the privacy page (`/privacy`), and the Jira OAuth 2.0 (3LO) relay: `/api/auth/jira`, `/api/auth/jira/refresh`, and `/auth/jira/callback`. It keeps no database.

The browser driver is **playwright-cli** (`@playwright/cli`). It is not the `@playwright/test` package that runs `pnpm test:e2e`. Most proofs here are HTTP transcripts made with curl.

All commands run from the repo root:

```bash
FW=.agents/skills/verify-fast-track-website/scripts/ft-verify-website
$FW help
```

## Launch

```bash
$FW doctor || amp orb service start ft-verify-website --command "$PWD/$FW run"
for i in $(seq 1 40); do $FW doctor 2>/dev/null && break; sleep 1; done
```

`run` starts `next dev -p 4000` with dummy `JIRA_CLIENT_ID` / `JIRA_CLIENT_SECRET` unless real values are in the environment. With dummy values, the relay builds its redirect and sets its session cookie, but Atlassian rejects the client. Ready means `doctor` prints `website on :4000 OK` (first start takes about 2 s; the first page request compiles for about 1 s more). Add `--portal` to the service command only when the user wants to open the page.

## Doctor

`$FW doctor` is read-only. It checks that port 4000 answers `/api/hello` with `Hello, from API!`, so another process on the port is not mistaken for the website. If doctor passes before you start the service, another run owns the website: use it read-only, or ask.

## Drive

- **Relay contract:** `$FW probe` (see [features/oauth-relay.md](features/oauth-relay.md)).
- **Pages:** `playwright-cli -s=<session> open --browser=chromium http://localhost:4000`, then `snapshot`, `screenshot --filename=<abs path>`, `goto <url>`. Always pass `--browser=chromium`: the default is Google Chrome, which the orb does not have.
- Use roles and accessible names from `snapshot`. Do not reuse snapshot refs across renders.

## Evidence

Files go to `.amp/in/artifacts/verify-fast-track-website/<FT_VERIFY_RUN or today's date>/`. `probe` writes `relay.txt` there; save screenshots there too. The client ID in the redirect is redacted. Inspect each screenshot with `view_media` before you cite it.

A proof uses the real routes, records the status code and the key header or body for each request, and states which steps it did not reach (a full Atlassian sign-in needs real client credentials and a human login).

## Cleanup

```bash
playwright-cli -s=<session> close
rm -rf .playwright-cli                 # snapshots and logs from sessions opened without --config
amp orb service stop ft-verify-website # only if this run started it
```

Never use `playwright-cli close-all`, `kill-all`, or `pkill`. Cleanup never deletes the evidence directory.

## Isolation

Port 4000 is fixed: the extension's dev build and the Atlassian callback URL expect it. Only one website instance can run at a time. Several browser sessions can share it.
