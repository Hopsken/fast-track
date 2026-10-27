# Fast Track website verification map

This directory is the maintained source for verifying user-facing behavior of the fast-track.work website. Read this index first, then use the matching feature file as the recipe.

## Baseline preconditions

- `FW=.agents/skills/verify-fast-track-website/scripts/ft-verify-website`, run from the repo root.
- `$FW doctor` prints `website on :4000 OK`, and this run started the `ft-verify-website` service (or shares it read-only).

## Driving conventions

- HTTP checks use curl through `$FW probe` or plain `curl -s -w '%{http_code}'`.
- Page checks use `playwright-cli -s=<session> open --browser=chromium <url>`, ARIA roles, and accessible names.

## Proof and skip reporting

- Record each request with its status code and the key header or body.
- Save artifacts under `.amp/in/artifacts/verify-fast-track-website/<run>/`.
- Report steps that need real Atlassian credentials or a human login as `not verified`, with the reason.

## Feature entry contract

Each feature file starts with an H1 title and one paragraph describing the user-visible behavior, then exactly four H2 sections in this order: `Sub-features`, `How to get to it (user POV)`, `Driving it with playwright-cli`, `Gotchas`.

## Features

- [Website and OAuth relay](./oauth-relay.md) covers the landing and privacy pages, the relay routes, and the callback error page. The token handoff to the extension is in the extension skill (`verify-fast-track`, `features/connect-jira.md`).
