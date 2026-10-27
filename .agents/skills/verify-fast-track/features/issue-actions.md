# Issue actions

From an issue in the popup, a user can copy issue data to the clipboard and change the assignee, status, or priority without opening Jira.

## Sub-features

- `actions-menu` shows the issue header and the `General` and `Misc` groups.
- `actions-copy` copies key, link, title, key and title, title link, or git branch name, shows a `Copied: ...` toast, and closes the popup.
- `actions-status` lists transitions and applies one.
- `actions-assign` assigns to a user, to me, or unassigns.
- `actions-priority` lists priorities and applies one.

## How to get to it (user POV)

- Popup → select a suggestion or search result → `Enter`.
- Hotkeys on a selected row: `⌘⇧S` status, `⌘⇧A` assign, `⌘⇧P` priority (skip the issue menu).
- Inside the issue menu: `⌘⇧K` copy key, `⌘⇧L` copy link, `⌘⇧T` copy title, `⌘⇧C` copy key and title, `⌘⇧M` assign to me.

## Driving it with playwright-cli

Preconditions:

- Signed in. Mock mode is enough for the menu and copy actions; status, assign, and priority need real mode.

- **Open menu.** `$FT open <session> popup`, wait, `$S press Enter`. The snapshot shows `PROJ-1` and options `Assign to...`, `Assign to me`, `Change status...`, `Change priority...`, `Copy issue key`. Capture `$FT evidence <session> actions-menu`.
- **Copy key.** Run `$S click '[data-value="copy-issue-key"]'`. The popup tab closes (`window.close()`).
- **Clipboard side effect.** Run `$FT open <session> options`, then `$S --raw run-code "async page => { await page.context().grantPermissions(['clipboard-read']); return page.evaluate(() => navigator.clipboard.readText()) }"`. Output is `"PROJ-1"`.
- **Record the baseline (real mode).** Read the issue's status, priority, and assignee with `curl -u "$JIRA_VERIFY_EMAIL:$JIRA_VERIFY_API_TOKEN" "$JIRA_VERIFY_HOST/rest/api/3/issue/<KEY>?fields=status,priority,assignee"`. Every write below is checked with this read, and the issue is restored to this baseline at the end.
- **Open a specific issue.** Fill the popup combobox with the issue key, wait for `option "Open ticket <KEY>: ..."`, and click `getByRole('option', { name: /<KEY>/ })`.
- **Change status (real mode).** Run `$S click '[data-value="change-status"]'`, then `$S click "getByRole('option', { name: '<transition>', exact: true })"`. A toast `Status updated` appears, the header shows the new status, and the REST read agrees. Move it back the same way; the transition list offers the previous status.
- **Priority (real mode).** Run `[data-value="change-priority"]`, then pick with the full accessible name and `exact: true`, for example `'High High'`. The REST read agrees.
- **Assign (real mode).** Run `[data-value="assign-to"]`, then pick for example `'<Name> <Name>'` with `exact: true`. Restore with `$S click '[data-value="assign-myself"]'`. The REST read agrees each time.
- **Restore proof.** The final REST read equals the baseline.

## Gotchas

- Real mode, read-only check: open `change-status`, `change-priority`, or `assign-to` and assert the option list, then `$S press Escape`. That proves the Jira reads without a write. Apply a value only on a disposable site.
- In mock mode `change-status` shows `No available transitions`, because the transitions endpoint has no mock. Report it as a mock gap, not a pass.
- Option names repeat the label: priorities are `High High`, `Highest Highest`, and users are `<Name> <Name>`. A regex such as `/^High/` matches `High` and `Highest`, so the click fails in strict mode. If you discard the playwright-cli output, the failure is silent and the REST read stays unchanged. Use `exact: true` and keep `grep Error` on the click output.
- `getByRole('option', { name: /Copy issue key/ })` matches two items (`Copy issue key` and `Copy issue key and title`). Use `data-value`.
- The toast lives only 20 ms before the tab closes. Prove the copy through the clipboard, not the toast.
- Hotkeys use `⌘` (Meta) labels; on Linux headless send `Control+Shift+<key>` or `Meta+Shift+<key>` and check which one the hotkey system binds before reporting a hotkey failure.
