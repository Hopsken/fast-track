# Menu Tree

All menus live under `src/entrypoints/popup/menus/`.

## MainMenu

`MainMenu/MainMenu.tsx` — root screen, wrapped in `HotkeysScopeProvider scope="main-menu"`.

**Prefix-based routing** on search input:

| Prefix | Menu | Description |
|--------|------|-------------|
| `/` | `ExtraActionsMenu` | Settings, feedback, utilities |
| `+`, `C`, `c` | `IssueTemplatesMenu` | Create from template |
| *(default)* | `TicketListMenu` | Suggestions + search results |

`shouldFilter` enabled only for prefixed menus (cmdk handles filtering).

### TicketListMenu

- Empty search → suggested tickets grouped by status (In Progress, Upcoming, Done, Recommend)
- With search → `SearchResultMenu` (live Jira search, scoped to frequent projects first, then all)
- Registers quick-nav hotkeys on the **selected** item: `⌘⇧S` (status), `⌘⇧P` (priority), `⌘⇧A` (assign) — opens submenu directly, bypassing IssueMenu

### IssueTemplatesMenu

Lists saved templates. On select → `navigate.push(<CreateIssueMenu template={t} />)`.

## IssueMenu

`IssueMenu/IssueMenu.tsx` — ticket fields + `IssueActions`.

### IssueActions

Wrapped in dual `HotkeysScopeProvider` (`issue-actions` + `issue-menu`).

**General:** Assign, Assign to me, Change status, Change priority — each as `ActionPush` with hotkey.

**Clipboard:** 6 copy actions (key, summary, url, branch, markdown, markdown-url).

### Sub-menus

`IssueAssignMenu`, `IssueStatusMenu`, `IssuePriorityMenu` — each an `ActionPanel` with search. `useIssueMenus()` hook provides navigation helpers (`openIssueMenu`, `openIssueAssignMenu`, etc.).

## CreateIssue Wizard

`CreateIssue/` — multi-step form with its own Zustand store (`useCreateIssueDraftStore`).

```
CreateIssueMenu (entry, sets up wizard)
  → CreateIssueFieldsMenu (review screen, scope: create-issue)
      ⌘Enter → submit
  → FieldInputMenu (per-field edit, scope: field-input)
      wrapped in NavigateBackProvider → Escape returns to review
  → SummaryDescriptionInput (special case)
```

**Draft store shape:** `template`, `values`, `errors`, `wizardFields`, `wizardIndex` (-1 = review, >=0 = editing field).

`useSetupWizard()` computes visible fields. `useWizardNavigation()` provides `goToNextField()` / `goBackToFieldsMenu()`.
