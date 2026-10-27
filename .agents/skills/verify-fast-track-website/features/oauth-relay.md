# Website and OAuth relay

fast-track.work serves the landing and privacy pages and relays the Jira OAuth 2.0 (3LO) flow, because Jira requires a client secret for the token exchange. The relay keeps no database.

## Sub-features

- `web-landing` serves `/` and `/privacy`.
- `relay-start` `GET /api/auth/jira?extension_id=<id>` sets an `oauth_session` cookie and redirects (307) to `auth.atlassian.com/authorize`.
- `relay-start-invalid` without `extension_id` returns 400 `extension_id parameter is required`.
- `relay-refresh-invalid` `POST /api/auth/jira/refresh` without `refresh_token` returns 400.
- `relay-callback-error` `/auth/jira/callback?error=access_denied` renders an error page.

## How to get to it (user POV)

- Browse to the site root.
- Options page → `Connect to Jira` → the relay start route.

## Driving it with playwright-cli

Preconditions:

- The website runs per the skill Launch section, and `$FW doctor` is OK.

- **Relay contract.** Run `$FW probe`. `relay.txt` shows `/` and `/privacy` `status=200`, the 400 for missing `extension_id`, `HTTP/1.1 307` with a `location: https://auth.atlassian.com/authorize?...` line, and the 400 for the empty refresh body.
- **Landing page.** `playwright-cli -s=web open --browser=chromium http://localhost:4000`, then `playwright-cli -s=web screenshot --filename=$PWD/.amp/in/artifacts/verify-fast-track-website/<run>/landing.png`. Inspect the screenshot.
- **Callback error.** `playwright-cli -s=web goto "http://localhost:4000/auth/jira/callback?error=access_denied"`. The snapshot has heading `Authentication Failed` and text `Authentication was cancelled or access was denied`. Then `playwright-cli -s=web close`.

## Gotchas

- With dummy client values the redirect is built, but Atlassian rejects the client. A full sign-in needs real `JIRA_CLIENT_ID`/`JIRA_CLIENT_SECRET` and an Atlassian app whose callback is `http://localhost:4000/auth/jira/callback`, plus a human login. Report it as not verified otherwise.
- The token handoff to the extension is verified in the extension skill: `verify-fast-track`, `features/connect-jira.md`, step `OAuth handoff`. Run it whenever you change `/auth/jira/callback` or `ExtensionCommunicator.tsx` (event names, payload shape, origin).
- Plain `playwright-cli open` defaults to Google Chrome, which the orb does not have. Always pass `--browser=chromium`.
- Port 4000 is fixed. Check `$FW doctor` before starting to see whether another instance already owns it.
