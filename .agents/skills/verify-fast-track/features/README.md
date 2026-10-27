# Fast Track verification map

This directory is the maintained source for verifying user-facing behavior of Fast Track. Read this index before driving the app, then use the matching feature file as the recipe.

## Baseline preconditions

- `FT=.agents/skills/verify-fast-track/scripts/ft-verify`, run from the repo root.
- `$FT launch <session> mock` (or `real` with `JIRA_VERIFY_*` set) succeeded and printed `extension_id=...`.
- `$FT doctor <session>` prints `doctor: OK` and `version` equals `repo_version`.
- Signed-in features also need `$FT sign-in <session>`, which must print `Connected to <host>`.
- Website features need the `ft-verify-website` service and `$FT website-doctor` OK.
- Never drive a session or website instance that this run did not start.

## Driving conventions

- `S="playwright-cli -s=<session>"`. Open pages with `$FT open <session> popup|options`.
- Prefer `getByRole(..., { name })`. For cmdk items in the popup use `[data-value="..."]`.
- Known `data-value` handles: `assign-to`, `assign-myself`, `unassign-myself`, `assignee-none`, `change-status`, `change-priority`, `copy-issue-key`, `copy-issue-link`, `copy-issue-title`, `copy-issue-key-and-title`, `copy-issue-title-link`, `copy-git-branch-name`, `new-issue`, `create-template`, `show-all-projects`, `dismiss-warning`.
- Snapshot refs (`f1e23`) are not stable across renders. Do not reuse them.
- Restore state after a mutation in real mode (status, assignee, priority, created issues).

## Proof and skip reporting

- Capture the state before and after the action with `$FT evidence <session> <feature>-<step>`.
- Also check the side effect: clipboard, `chrome.storage.local`, or the Jira issue (real mode).
- State the mode with each artifact. Mock mode proves UI wiring to fixtures, not Jira behavior.
- A step that needs an endpoint the mock does not cover is reported as `not verified (mock gap: <endpoint>)`. Do not report it as passed through a different path.

## Feature entry contract

Each feature file starts with an H1 title and one paragraph describing the user-visible behavior, then exactly four H2 sections in this order: `Sub-features`, `How to get to it (user POV)`, `Driving it with playwright-cli`, `Gotchas`.

## Features

- [Connect Jira](./connect-jira.md) covers the options-page API key and OAuth sign-in, the connected card, and disconnect.
- [Popup suggestions](./popup-suggestions.md) covers the unauthenticated notice and the grouped suggested issues.
- [Issue actions](./issue-actions.md) covers the issue menu, copy actions, and status/assign/priority sub-menus.
- [Command prefixes and search](./command-prefixes.md) covers `/` commands, `+` templates, and live search.
- [Issue templates](./issue-templates.md) covers the options Templates tab and the template wizard.
- [Website and OAuth relay](./website-oauth-relay.md) covers the landing page and the relay routes.
