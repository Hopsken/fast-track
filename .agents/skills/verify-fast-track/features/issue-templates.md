# Issue templates

On the options page a user creates reusable issue templates (name, project, issue type, field defaults), then uses them from the popup `+` prefix to create issues in a few keystrokes.

## Sub-features

- `templates-empty` shows `No templates` and a `New template` link.
- `templates-wizard` creates a template: `Template name`, `Project`, `Issue type`, then `Create`.
- `templates-detail` opens and edits a saved template at `#/templates/<id>`.
- `templates-use` creates an issue from a template in the popup.

## How to get to it (user POV)

- Options page → `Templates` tab (`options.html#/templates`) → `New template`.
- Popup → `+` → pick a template.

## Driving it with playwright-cli

Preconditions:

- Signed in. The project and issue-type pickers need real mode.

- **Empty list.** `$S goto chrome-extension://<id>/options.html#/templates`. Heading `Templates`, text `No templates`, link `New template`. Capture `$FT evidence <session> templates-empty`.
- **Wizard (real mode).** Go to `#/templates/new`. Fill `getByRole('textbox', { name: 'Template name' })`. Click and fill `getByRole('combobox', { name: 'Project' })` with a project name, then pick for example `getByRole('option', { name: 'Flow Flow' })`. Open combobox `Issue type` and pick for example `'Task Task'`. Button `Create` becomes enabled. Click it with `exact: true`. The page returns to `#/templates`.
- **Side effect.** The list shows link `<name> <Project> • <Type>`, and `IssueTemplates` in `chrome.storage.local` contains it with `scope.project.key` and `scope.issueType.name`. Read it through the service worker as in `cmd_doctor`.
- **Use it (real mode).** In the popup, fill `C <template name>` (not `+`: see the known bug in [Command prefixes](./command-prefixes.md)). Click `getByRole('option', { name: /<template name>/ })`. Fill combobox `Issue title…` with a unique title, then click `getByRole('button', { name: /Create issue/ })`. The popup closes. Search Jira by REST (`POST /rest/api/3/search/jql` with `summary ~ "<title>"`). The issue exists with the template's project and type.
- **Cleanup (real mode).** Delete the created issue with `DELETE /rest/api/3/issue/<KEY>` (expect 204, then GET gives 404). Delete the template through the UI: open its link, click `Delete`, then click `getByRole('alertdialog').getByRole('button', { name: 'Delete' })`. The list shows `No templates` and `IssueTemplates` is empty.

## Gotchas

- In mock mode the `Project` combobox opens an empty listbox, because the projects endpoint has no mock, so `Create` stays disabled. Report it as a mock gap.
- With an empty query the `Project` picker lists only *recent* projects (often one). Type part of a name or key to search all projects. One option is not a bug.
- The e2e spec `create-issue-hub.spec.ts` seeds `IssueTemplates` in storage. That skips the wizard, so it does not prove `templates-wizard`.
