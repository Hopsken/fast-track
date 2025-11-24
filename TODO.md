# TODO

- [x] Fix RxDB accessors in services to use `database.collections.issues` instead of `database.issues` (breaks search results and suggestions).
- [x] Switch RxDB storage from in-memory to persistent (IndexedDB, optionally with key compression) so cached tickets survive background restarts.
- [x] Implement live Jira search (Issue Picker/JQL) and merge with cached results; add error handling and proper loading states.
- [x] Store/use human-facing Jira browse URLs for tickets (e.g., `${host}/browse/${key}`) instead of API `issue.self`, so popup opens real issue pages.
- [x] Make auth flow resilient: handle token refresh failures and surface graceful UX/errors (API key support removed for now).
- [x] Keep a stable alarms listener reference in `BackgroundAlarmsService.destroy` to avoid leaks when teardown runs.
- [x] Add user-facing error states for failed searches/auth and ensure popup reflects connectivity issues.
- [ ] Search improvements:
  - [ ] Switch remote search to JQL-based issue search.
  - [ ] Rank search results by how closely they match the query sentence.
  - [ ] For empty queries, surface the most recently started in-progress tickets first.
- [ ] Run launch QA: `pnpm typecheck`, `pnpm lint`, `pnpm format:check`, plus manual smoke for connect → search → open issue, omnibox shortcut, and browser restart persistence.
