---
name: verify-fast-track
description: Drive the real Fast Track for Jira browser extension (popup + options page, MV3, Chromium) and the fast-track.work website (landing page + Jira OAuth relay) to prove a change works. Use it after any change to apps/extension or apps/website when you need screenshots, ARIA snapshots, or relay transcripts as evidence, not only unit or e2e test results.
---

# Verify Fast Track

Two surfaces:

- **Extension** (primary). A user opens the popup (`Alt+J` or the toolbar icon) to search Jira issues and act on them, and opens the options page to connect Jira, change settings, and manage issue templates.
- **Website** (`apps/website`, Next.js on port 4000). The landing page and the OAuth relay (`/api/auth/jira`, `/api/auth/jira/refresh`, `/auth/jira/callback`).

The driver is **playwright-cli** (`@playwright/cli`, the agent CLI, pinned in the helper). It is not the `@playwright/test` package that runs `pnpm test:e2e`. Do not mix them: the e2e suite has its own fixture in `apps/extension/tests/e2e/fixtures/extension.ts`. Run `pnpm test:e2e` as a regression check, and use this skill to drive and observe the app.

All commands below run from the repo root. The helper is:

```bash
FT=.agents/skills/verify-fast-track/scripts/ft-verify
$FT help
```

## Jira backend modes

| Mode | Build | Jira traffic | Use for |
| --- | --- | --- | --- |
| `mock` (default) | `VITE_E2E_MOCKS=1` | axios adapter in `apps/extension/src/lib/jira/e2e/axios-mocks.ts`. Unknown endpoints return 501. | UI flows, sign-in, suggestions, copy actions, menus |
| `real` | normal build | A real Jira Cloud site | Status/assign/priority changes, search, templates, issue creation |

Real mode needs `JIRA_VERIFY_HOST`, `JIRA_VERIFY_EMAIL`, and `JIRA_VERIFY_API_TOKEN` in the environment (set them as Amp secrets, then `amp orb restart-processes`). Use a disposable test site: real mode writes to Jira. If the variables are missing, or Jira answers `GET /rest/api/3/myself` with anything other than 200, `launch ... real` stops with an error before it builds. Project-scope Amp secrets and env vars reach the shell only after `amp orb restart-processes`. Do not fall back to mock mode and report it as a real-Jira proof.

The mock covers only: `POST /rest/api/3/search*` for the three suggestion JQLs, `GET /rest/api/3/issue/createmeta/{project}/issuetypes/{type}`, and `GET /rest/api/3/myself`. To prove a flow that needs another endpoint in mock mode, add a branch to `axios-mocks.ts` first (that is a code change, so say so in the report).

## Launch

```bash
$FT launch <session> [mock|real]   # e.g. $FT launch fix-123
$FT sign-in <session>              # connects through the options page "API key" form
```

`launch` does this:

1. Installs `@playwright/cli@0.1.22` and its Chromium if missing.
2. Builds the extension with turbo (about 20 s cold, under 1 s cached). Mock mode sets `VITE_E2E_MOCKS=1`.
3. Copies `apps/extension/.output/chromium-mv3` to `/tmp/ft-verify/<session>/extension`, so a later rebuild cannot change a running session.
4. Opens a headless Chromium with that extension and a fresh profile in `/tmp/ft-verify/<session>/profile`.
5. Waits for the MV3 service worker, and in mock mode sets the runtime flag `__JIRA_BOOST_E2E__` (the mock adapter needs both the build flag and this flag).

Ready means `launch` printed `session=... extension_id=...`, and after `sign-in` the options page shows `Connected to <host>`. A fresh profile is empty: it is not signed in and has no templates. `sign-in` uses the mock credentials (`https://test.atlassian.net`, `test@example.com`, mock user `Test User`) or the real ones from the environment. Its output never prints the token.

After you change extension code, clean up the session and launch again. The session copy does not reload.

### Website

```bash
amp orb service start ft-verify-website --command "$PWD/$FT website-run"
$FT website-doctor     # ready when it prints "website on :4000 OK"
```

`website-run` starts `next dev -p 4000` with dummy `JIRA_CLIENT_ID` / `JIRA_CLIENT_SECRET` unless real values are in the environment. With dummy values, the relay builds its redirect and sets its session cookie, but Atlassian rejects the client. Add `--portal` to the service command only when the user wants to open the page.

## Doctor

```bash
$FT doctor <session>
```

Read-only. It prints the extension's service-worker state as JSON (`extensionId`, `version`, `mocksArmed`, `signedInHost`) and exits non-zero when:

- playwright-cli has no browser with that session name,
- the extension service worker is not running,
- a real-mode build contains mock code,
- a mock-mode service worker lost `__JIRA_BOOST_E2E__` (the MV3 worker restarted). Fix with `$FT arm-mocks <session>`.

`version` must match `repo_version`. If not, you are driving an old build. Run doctor first whenever a result looks wrong.

For the website, `$FT website-doctor` checks that port 4000 answers `/api/hello` with `Hello, from API!`, so another process on the port is not mistaken for the website.

## Drive

Open a page, then use playwright-cli with the same session name:

```bash
$FT open <session> popup        # or: options
S="playwright-cli -s=<session>"
$S snapshot                     # ARIA tree with refs
$S fill "getByRole('combobox', { name: 'Search or / for commands' })" "/"
$S press Enter
$S click '[data-value="copy-issue-key"]'
$S console warning              # page console
```

Rules:

- Use roles and accessible names (`getByRole(...)`) or the cmdk `data-value` attributes. The full list of `data-value` handles is in [features/README.md](features/README.md). Do not use snapshot refs (`f1e23`) across commands: they change after every render.
- A regex name such as `/Copy issue key/` matches two options. Use `data-value`.
- Options-page routes are hash routes: `options.html#/general`, `#/templates`, `#/templates/new`, `#/about`. Use `$S goto chrome-extension://<id>/options.html#/templates`. The ID is in `/tmp/ft-verify/<session>/extension-id`.
- The popup runs as a normal tab (1280×800), not in the toolbar bubble. Layout is the 576 px popup column at the left.
- Copy actions call `window.close()`, so the tab closes. `$FT open` then opens a new tab. To read the clipboard, open another extension page and run:
  `$S --raw run-code "async page => { await page.context().grantPermissions(['clipboard-read']); return page.evaluate(() => navigator.clipboard.readText()) }"`
- For service-worker state (for example `chrome.storage.local`), use `run-code` with `page.context().serviceWorkers()`. See `cmd_doctor` in the helper. Read storage only to confirm a side effect. Do not write storage to skip a user step, except where a feature file says a precondition must be seeded.
- Wait for a visible result (`snapshot | grep ...` in a loop), not a fixed long sleep. A 1–2 s pause after `open` is enough for the first render.

## Evidence

```bash
$FT evidence <session> <feature>-<step>   # saves <name>.png and <name>.aria.md
$FT website-probe                         # saves website/relay.txt
```

Files go to `.amp/in/artifacts/verify-fast-track/<FT_VERIFY_RUN or today's date>/`. Set `FT_VERIFY_RUN=<short-name>` to keep runs apart. Inspect each screenshot with `view_media` before you cite it.

A proof must:

- Go through the real user path (popup or options UI). Do not call service methods or write storage instead.
- Capture the state before and after the action, not only the final screen.
- Check the side effect too: clipboard content, `AuthCredentials` / `IssueTemplates` in `chrome.storage.local`, or the issue in Jira (real mode).
- Name the mode. A mock-mode proof shows UI wiring to a fixture, not Jira behavior.

## Cleanup

```bash
$FT cleanup <session>                 # closes only that browser, deletes /tmp/ft-verify/<session>
amp orb service stop ft-verify-website
```

A playwright-cli session that you open without `--config` (for example the `web` session in the website recipe) writes snapshots and logs to `.playwright-cli/` in the repo. Run `rm -rf .playwright-cli` after you close it. Cleanup never deletes the evidence directory. Do not use `playwright-cli close-all`, `kill-all`, or `pkill chrome`: other agents may run their own sessions. Clean up after failed runs too.

## Isolation

- Each session has its own profile, extension copy, and playwright-cli daemon, so sessions can run side by side. Use a new session name per run, and never drive a session you did not launch.
- `launch` rebuilds the shared `apps/extension/.output`. Two launches at the same moment in different modes can race. Launch one at a time.
- The website uses port 4000, because the extension and the Atlassian callback URL expect it. Only one website instance can run. If `website-doctor` passes before you start the service, someone else owns it: use it read-only, or ask.
