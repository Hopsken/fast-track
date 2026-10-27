# Popup suggestions

When a user opens the popup with an empty search box, Fast Track lists their suggested issues grouped as In Progress, Upcoming, and Recommend for you. When not signed in, the popup shows a Connect notice instead.

## Sub-features

- `popup-signed-out` shows `Connect to Jira` and a `Connect` button that opens the options page.
- `popup-groups` lists suggestions in groups `In Progress`, `Upcoming`, `Recommend for you`.
- `popup-row` shows summary, key, priority, status, and assignee per row.
- `popup-open-issue` opens the issue menu on `Enter` or click.

## How to get to it (user POV)

- Toolbar icon or `Alt+J` opens the popup.
- In this harness: `$FT open <session> popup`.

## Driving it with playwright-cli

Preconditions:

- Mock mode for fixture data: `PROJ-1` "In progress ticket", `PROJ-2` "Upcoming ticket", `PROJ-9` "Recently viewed ticket".

- **Signed out.** Before `sign-in`, run `$FT open <session> popup` and `$S snapshot`. Text `Connect to Jira` and button `Connect` are visible. Capture `$FT evidence <session> popup-signed-out`.
- **Connect button.** Run `$S click "getByRole('button', { name: 'Connect' })"`, then `$S tab-list`. A tab with `options.html` exists.
- **Suggestions.** Run `$FT sign-in <session>`, `$FT open <session> popup`, wait about 2 s, then `$S snapshot`. Listbox `Suggestions` has groups `In Progress`, `Upcoming`, `Recommend for you` with options `Open ticket PROJ-1: In progress ticket`, `Open ticket PROJ-2: Upcoming ticket`, `Open ticket PROJ-9: Recently viewed ticket`. Capture `$FT evidence <session> popup-suggestions`.
- **Open issue.** Run `$S press Enter`. The header shows `PROJ-1` and groups `General` and `Misc` appear (see [Issue actions](./issue-actions.md)).

## Gotchas

- The React Query cache persists in `chrome.storage.local` (`REACT_QUERY_OFFLINE_CACHE`). A second open can show cached rows before any fetch; use a fresh session to prove a fetch.
- The `Recommend for you` group label differs from the mock's "Done" status category. Assert group names from the snapshot, not from the fixture.
- Real mode shows whatever the test site has. Name the issue keys you assert in the report.
