# Connect Jira

The options page lets a user connect a Jira Cloud workspace with OAuth ("Sign in with Atlassian") or an API token, shows the connected account, and lets the user disconnect.

## Sub-features

- `connect-apikey` connects with site URL, email, and API token.
- `connect-card` shows the user name, email, and `Connected to <host>` badge.
- `connect-disconnect` removes the connection and returns to the sign-in tabs.
- `connect-oauth-start` opens the website relay at `/auth/jira?extension_id=<id>`.
- `connect-oauth-handoff` accepts tokens from the website callback page, stores OAuth credentials, and confirms back to the page. It rejects other origins and malformed payloads.

## How to get to it (user POV)

- Options page → General tab → `Jira Connection` section.
- Popup when signed out → `Connect` button (opens the options page).
- First install opens the options page automatically (skipped in mock builds).
- After Atlassian sign-in, the website callback page `/auth/jira/callback` hands the tokens to the extension.

## Driving it with playwright-cli

Preconditions:

- A fresh session from `$FT launch <session>`; not signed in.

- **Signed-out state.** Run `$FT open <session> options`, then `$S snapshot`. Tabs `Sign in with Atlassian` (selected) and `API key` are present. Capture `$FT evidence <session> connect-before`.
- **API key sign-in.** Run `$FT sign-in <session>`. It clicks tab `API key`, fills textboxes `Jira site URL`, `Jira account email`, `API token`, and clicks button `Connect` (exact). It prints the `Connected to <host>` line and the heading `Test User` (mock).
- **Side effect.** Run `$FT doctor <session>`. `signedInHost` equals the host you entered. Capture `$FT evidence <session> connect-after`.
- **Disconnect.** Run `$S click "getByRole('button', { name: 'Disconnect' })"`. A native confirm `Disconnect from Jira? ...` opens; run `$S dialog-accept`. The sign-in tabs return and `$FT doctor` shows `signedInHost: null`. Capture `$FT evidence <session> connect-disconnected`.
- **OAuth handoff.** This one needs its own session: `$FT launch <session> mock-dev`. It also needs the website: start it with the `verify-fast-track-website` skill (`ft-verify-website run` as the `ft-verify-website` service). Then run the cases in this order, so storage is still empty for the controls:
  - `$FT oauth-handoff <session> wrong-origin`: a page on `http://localhost:4001` gets no reply (`"timeout"`), and storage does not change.
  - `$FT oauth-handoff <session> bad-schema`: the reply has `success: false` with the zod errors, and storage does not change.
  - `$FT oauth-handoff <session> mocks-off`: with the runtime mock flag off, the reply has `success: false` with `401 ... accessible-resources`, and storage does not change. This is how a fake token behaves against real Atlassian.
  - `$FT oauth-handoff <session> valid`: the reply has `success: true`, and `AuthCredentials` becomes `type: oauth`, host `https://test.atlassian.net`, instance `test-cloud-id`, user `Test User`.
  Each case prints `PASS` or exits non-zero with `FAIL`, and saves `oauth-handoff-<case>.json`. Then `$FT open <session> options` shows `Connected to test.atlassian.net`. Capture `$FT evidence <session> oauth-connected`.
- **OAuth start.** Click `getByRole('button', { name: 'Connect to Jira' })` on the `Sign in with Atlassian` tab, then `$S tab-list`. A new tab lands on `id.atlassian.com/login` with `redirect_uri=https://fast-track.work/auth/jira/callback`. The rest needs a human Atlassian login; report it as not verified. Close the tab with `$S tab-close 1`.

## Gotchas

- In mock mode the sign-in only succeeds while `__JIRA_BOOST_E2E__` is set. If it fails with a network error, run `$FT arm-mocks <session>` and retry.
- The button name `Connect` also matches `Connect to Jira`. Use `exact: true`.
- `$FT launch` makes a production build (`import.meta.env.DEV` is false), so `Connect to Jira` calls the **live** `https://fast-track.work` relay and Atlassian over the network. Click it only when OAuth start is what you are proving.
- `oauth-handoff` dispatches the same `jira-oauth-tokens` event that the website's `ExtensionCommunicator` sends, but it does not run that component. The component renders only after a real Atlassian code exchange. If you change the event name or payload on the website side, update the handoff and check the website code by reading it.
- Production builds run the OAuth content script only on `https://fast-track.work/auth/jira/callback*`. Do not use `mock` or `real` sessions for the handoff. They fail with "needs a mock-dev session".
- Disconnect waits on a native `confirm()`. Without `dialog-accept` the page looks stuck.
