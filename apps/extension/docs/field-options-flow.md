# Field Options Flow

How field options (dropdown choices, user lists, etc.) are loaded in the create-issue wizard.

**File:** `src/common/fields/hooks/useFieldOptions.ts`

## Option Source Precedence

Three tiers, highest priority first:

| # | Source | When | Notes |
|---|--------|------|-------|
| 1 | **Server search** | `config.behavior !== 'restricted'` AND no `allowedValues` in Jira metadata | Debounced 300ms, React Query cached. Most up-to-date. |
| 2 | **Jira metadata `allowedValues`** | Jira provides allowed values for the field | Mapped via `adapter.fromDTO()`. No server call. |
| 3 | **Local config `allowedOptions`** | Template designer pre-configured options | Fully local. |

## Server Search

- Debounced with `useDebounce(query, { wait: 300 })`
- Cache key: `['field-options', adapter.key, project.key, issueType.id, debouncedQuery]`
- `placeholderData: keepPreviousData` — shows stale results during loading for smooth UX
- `isLoading` only surfaced during server-search mode (local ops assumed instant)

## Known Issue: Local Filter Bug

In tier 3 (local `allowedOptions`), the hook computes a filtered result but **never assigns it** — returned options are always the full unfiltered list regardless of search query.

Impact: search input does nothing in restricted/local mode. Fix: assign the filter result.

## See Also

- [Field Adapters](./field-adapters.md) — adapter registration and resolution
