# Field Adapter System

Adapter pattern for handling Jira field types in the create-issue wizard.

**Key files:**
- `src/common/fields/index.ts` — registration entry point
- `src/common/fields/registry.ts` — resolution logic
- `src/common/fields/adapters/` — individual adapters

## Registration

Adapters registered at module load time via `registerAdapter(adapter)` in `index.ts`.

| Category | Adapters |
|----------|----------|
| System fields | Priority, Assignee, Label, Parent |
| Custom fields | Sprint |
| Type adapters | Component, User, Resolution, Date, DateTime |

**Adding a new adapter:**
1. Implement `FieldAdapter<Schema>` (with `fromDTO`, `toDTO`, validation)
2. Register in `index.ts` via `registerAdapter(adapter)`

**Consumer APIs:** `getFieldAdapter(schema)` (imperative) / `useFieldAdapter(schema)` (hook with React Query)

## Resolution

`getFieldAdapter(schema)` resolves adapters by specificity:

```
1. schema.system  exact match  →  e.g. "assignee" → JiraAssigneeAdapter
2. schema.custom  exact match  →  e.g. sprint plugin field
3. schema.type    match        →  array fields try schema.items first
4. FallbackAdapter + warning log
```

The array handling is notable: `schema.type === 'array'` with `schema.items` reuses single-item adapters (e.g. `array + user` resolves to the user adapter).

## Field Context

`src/common/fields/adapters/shared/context.tsx` — thin provider passing `adapter`, `config`, and `context` down the tree. Throws if used outside provider (fail-fast). See source — it's ~20 lines.

## See Also

- [Field Options Flow](./field-options-flow.md) — how options are fetched and prioritized
