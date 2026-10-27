# Command prefixes and search

The popup search box routes by prefix: plain text runs a live Jira search, `/` lists extra commands, and `+` (or `c`/`C`) lists issue templates for quick creation.

## Sub-features

- `search-live` searches Jira for the typed text and shows results plus `Show more results`.
- `prefix-commands` with `/` shows `Create Issue`, `Settings`, `Feedback`.
- `prefix-templates` with `+` lists saved templates or `No templates`.

## How to get to it (user POV)

- Popup → type in combobox `Search or / for commands`.

## Driving it with playwright-cli

Preconditions:

- Signed in. Live search results need real mode.

- **Commands.** `$S fill "getByRole('combobox', { name: 'Search or / for commands' })" "/"`. Options `Create Issue ...`, `Settings`, `Feedback` appear. Capture `$FT evidence <session> prefix-commands`.
- **Settings command.** Select `getByRole('option', { name: 'Settings' })`. A tab with `options.html` opens (`$S tab-list`).
- **Templates.** Fill `+`. With a template saved (see [Issue templates](./issue-templates.md)), option `New issue` and group `Issue Templates` with the template name appear. Fill `+ <part of template name>`. Only the matching templates stay. Capture `$FT evidence <session> prefix-templates`.
- **Templates via `c`/`C`.** Fill `C <part of template name>`. Group `Issue Templates` lists the template, and option `New issue` is present.
- **Live search (real mode).** Fill a word from a known issue summary. An option with that issue key appears. Capture `$FT evidence <session> search-live`.

## Gotchas

- Mock mode has no mock for free-text JQL, so a search shows only `Show more results`. Report live search as a mock gap.
- `MainMenu` removes a leading `+` before cmdk scores the items, because no item contains `+`. `c` and `/` are not removed: `c` matches the keyword `create`, and each `/` command value starts with `/`. In v2.8.1 and earlier, a bare `+` showed `No templates` even when templates existed. `No templates` is not proof that storage is empty: check `IssueTemplates`.
- cmdk matching is fuzzy and includes the random template id. A query such as `+ zzz` can still match a template whose id contains `z`. To prove a no-match case, use letters that are not in the name or the id, for example `+ qqqq`.
- `c` and `C` are also template prefixes, so a search query starting with `c` opens the templates list, not search.
- Search is debounced. Poll the snapshot for the result instead of a fixed sleep.
