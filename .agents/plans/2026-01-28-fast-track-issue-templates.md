---
date: '2026-01-28'
title: 'Fast Track Issue Templates'
directory: '/Users/shaowei/Projects/jira-boost'
status: 'pending'
dependencies: []
dependents: []
---

# Goal/Overview

Build **Fast Track Issue Templates** for the Jira Boost browser extension.

Users can create reusable templates tied to a Jira **site + project + issueType**, where each template defines per-field behavior:

- **preset**: auto-fill a value and normally hide the field
- **visible**: show the field for user input
- **ignore**: omit the field entirely

During issue creation, the popup renders the form immediately from local cache, then **lazy-refreshes Jira metadata** to detect drift (allowed values changed, new required fields, removed fields) and **updates the form at runtime**.

This plan is intended for an agent who has no access to the original conversation. It captures all decisions and rationale.

Authoritative functional spec: `/Users/shaowei/Projects/jira-boost/specs/Fast Track Issue Template PRD.md`
Current technical RFC (already updated during this thread): `/Users/shaowei/Projects/jira-boost/specs/Fast Track Issue Template RFC.md`

## Why

- Reduce “form hell” when creating Jira issues.
- Provide Linear-style fast capture: type `+<trigger>`, pick template, fill only the remaining fields.

---

# Approaches Considered (Accepted + Rejected)

## A. Always compute visible fields using live Jira Create Meta API

- **Rejected** because it adds latency and requires a network call before rendering, degrading the “fast” experience.
- Also increases failure modes (offline, Jira slow) and makes popup feel sluggish.

## B. Store full `FieldCreateMetadata`/`allowedValues` inside each template (sync)

- **Rejected** due to Chrome `storage.sync` quota and template bloat.
- It also creates high churn: schema changes would force template writes.

## C. **Hybrid storage** (template minimal in sync, metadata cached in local) + **lazy-load reconciliation**

- **Accepted**.
- Rationale: Keep templates sync-friendly and stable (user intent only). Cache large Jira metadata locally; refresh lazily.

## D. Periodic background polling (alarms) to validate templates hourly

- **Rejected** as wasteful (wakes service workers, uses network/battery) for a feature used intermittently.

## E. **Popup-triggered validation refresh** (no polling)

- **Accepted**.
- Additionally refined to: **only refresh active site’s 5 most recently used templates** when popup opens.

---

# Explicit Decisions / Agreements

1. **Lazy-load timing strategy = “C strategy”**
   - Render form immediately using cached metadata.
   - In parallel, refresh Jira metadata and detect conflicts.
   - If conflicts exist, **update the form dynamically** (do not just fail on submit).

2. **Storage split**
   - `IssueTemplate` in `chrome.storage.sync` is minimal and sync-friendly.
   - Jira field metadata (`FieldCreateMetadata` subset) and `allowedValues` stored in `chrome.storage.local`.

3. **Conflict behavior**
   - `preset_invalid` → promote field to visible with warning; user must choose a valid value.
   - `now_required` → add field to form.
   - `field_removed` → warn and ignore.
   - `scope_invalid` → disable template usage (project/issueType missing).

4. **Refresh policy update (resource-saving)**
   - No periodic background alarms.
   - On popup open, refresh conflicts/caches for active site’s **recent 5 templates**.

5. **Recent templates definition**
   - Add `IssueTemplate.lastUsedAt?: string` (ISO) and update it when user selects a template for issue creation.

---

# Open Questions / Decision Points

Some decisions were not fully confirmed in conversation; before implementing, confirm them with the product owner (the user):

1. **Trigger prefix**: RFC mentions `C` or `+`. Is the release trigger **`+` only** or **both**?
2. **Refresh timing**: Should the “refresh recent 5 templates” run on **popup open** or only when user enters TemplateMenu (typing prefix)?
3. **MRU persistence**: We decided `lastUsedAt` stored in sync. Is frequent sync write acceptable, or should we store MRU locally to reduce sync churn?
4. **Field type scope for MVP**: RFC lists string/number/select/priority/array(tags+options)/user. Confirm no extra types needed.

If the owner is not available, proceed with RFC defaults:

- Trigger supports `C` and `+`.
- Refresh on popup open, TTL=24h.
- `lastUsedAt` in sync.
- MVP field types as listed in RFC.

---

# Dependencies

No new external packages are required if existing stack already includes:

- React Query
- Zustand
- `@webext-core/proxy-service`
- `jira.js`
- Vitest

Potentially useful but optional:

- A lightweight LRU/MRU helper (can be implemented manually)

---

# File Structure

## Existing docs

- `./specs/Fast Track Issue Template PRD.md`
- `./specs/Fast Track Issue Template RFC.md` (already modified to reflect decisions)

## New/Modified implementation files (proposed)

Under `./apps/extension/src/`:

### Types

- `types/template.ts` (NEW)

### Storage

- `lib/storage/schema.ts` (MODIFY)
  - add `sync:IssueTemplates`
  - add `local:FieldMetadataCache`
  - add `local:TemplateConflicts`

### Services

- `services/template-service/index.ts` (NEW)
- `services/template-service/gap-analysis.ts` (NEW)
- `services/template-service/conflict-detection.ts` (NEW)

### Hooks

- `hooks/useTemplates.ts` (NEW)
- `hooks/useFieldMetadataCache.ts` (NEW)
- `hooks/useCreateIssueForm.ts` (NEW)

### Popup UI

- `entrypoints/popup/menus/MainMenu/TemplateMenu.tsx` (NEW)
- `entrypoints/popup/menus/MainMenu/CreateIssueMenu.tsx` (NEW)
- `entrypoints/popup/App.tsx` (MODIFY)
  - trigger `refreshForActiveSite({limit: 5, ttlMs})` once per popup session

### Options UI

- `entrypoints/options/components/tabs/TemplatesTab.tsx` (NEW)
- `entrypoints/options/components/tabs/TemplateList.tsx` (NEW)
- `entrypoints/options/components/tabs/TemplateEditor.tsx` (NEW)

### Field components

- `components/fields/FieldRenderer.tsx` (NEW)
- `components/fields/*Field.tsx` (NEW)

### Jira integration

- `/Users/shaowei/Projects/jira-boost/apps/extension/src/lib/jira/issues.ts` (MODIFY)
  - expose methods to fetch create meta fields + create issue

### Tests

- `services/template-service/gap-analysis.test.ts` (NEW)
- `services/template-service/conflict-detection.test.ts` (NEW)
- `services/template-service/index.test.ts` (NEW)

(End-to-end tests are optional in MVP depending on existing infra.)

---

# Component Breakdown

## 1) Data Types

File: `/Users/shaowei/Projects/jira-boost/apps/extension/src/types/template.ts`

```ts
export interface IssueTemplate {
  id: string
  name: string
  trigger: string
  icon?: string
  scope: TemplateScope
  fields: Record<string, FieldConfig>
  descriptionTemplate?: string
  createdAt: string
  updatedAt: string
  lastUsedAt?: string
}

export interface TemplateScope {
  siteUrl: string
  projectKey: string
  issueTypeId: string
  issueTypeName: string
}

export interface FieldConfig {
  behavior: 'preset' | 'visible' | 'ignore'
  presetValue?: unknown
}

export interface CachedFieldMetadata {
  cacheKey: string // `${siteUrl}:${projectKey}:${issueTypeId}`
  lastUpdated: string
  fields: FieldMetadata[]
}

export interface FieldMetadata {
  fieldId: string
  key: string
  name: string
  required: boolean
  schema: JsonType
  allowedValues?: AllowedValue[]
  autoCompleteUrl?: string
  hasDefaultValue?: boolean
  defaultValue?: unknown
}

export type ConflictType =
  | 'preset_invalid'
  | 'now_required'
  | 'field_removed'
  | 'scope_invalid'

export interface FieldConflict {
  fieldId: string
  fieldName: string
  type: ConflictType
  message: string
  fieldMetadata?: FieldMetadata
}
```

## 2) Storage items

File: `/Users/shaowei/Projects/jira-boost/apps/extension/src/lib/storage/schema.ts`

Add items:

- `sync:IssueTemplates` fallback `[]`
- `local:FieldMetadataCache` fallback `{}`
- `local:TemplateConflicts` fallback `{}`

Also add any helper selectors in `/lib/storage/fromStorage.ts` if that is the pattern.

## 3) TemplateService (proxy service)

File: `/Users/shaowei/Projects/jira-boost/apps/extension/src/services/template-service/index.ts`

Use `defineProxyService` like other services.

Recommended signatures:

```ts
export interface RefreshForActiveSiteOptions {
  ttlMs: number
  limit: number // 5
}

export class TemplateServiceImpl {
  // CRUD
  getTemplates(): Promise<IssueTemplate[]>
  getTemplate(id: string): Promise<IssueTemplate | null>
  createTemplate(
    input: Omit<IssueTemplate, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<IssueTemplate>
  updateTemplate(
    id: string,
    updates: Partial<IssueTemplate>
  ): Promise<IssueTemplate>
  deleteTemplate(id: string): Promise<void>

  // Usage tracking
  markTemplateUsed(id: string, usedAt?: string): Promise<void>

  // Cache/conflicts
  getFieldMetadataCache(cacheKey: string): Promise<CachedFieldMetadata | null>
  updateFieldMetadataCache(
    cacheKey: string,
    cache: CachedFieldMetadata
  ): Promise<void>
  getTemplateConflicts(templateId: string): Promise<FieldConflict[]>
  updateTemplateConflicts(
    templateId: string,
    conflicts: FieldConflict[]
  ): Promise<void>

  // Refresh
  refreshForActiveSite(options: RefreshForActiveSiteOptions): Promise<void>
}
```

Implementation notes:

- `refreshForActiveSite` should:
  1. Determine active Jira site URL (likely via existing “current site”/auth state).
  2. Filter templates by `scope.siteUrl`.
  3. Sort by `lastUsedAt` desc (fallback `updatedAt` or `createdAt`).
  4. Take first `limit` templates.
  5. For each template, call `refreshAndDetectConflicts` (below) and store updated cache/conflicts.
  6. Use TTL guard: if `FieldMetadataCache[cacheKey].lastUpdated` is within TTL, skip refresh for that cacheKey.

## 4) Gap analysis (compute visible fields)

File: `/Users/shaowei/Projects/jira-boost/apps/extension/src/services/template-service/gap-analysis.ts`

```ts
export interface VisibleField {
  fieldId: string
  metadata?: FieldMetadata
  presetValue?: unknown
  isEditable: boolean
  conflict?: FieldConflict
}

export function computeVisibleFields(
  template: IssueTemplate,
  cache?: CachedFieldMetadata,
  conflicts?: FieldConflict[]
): VisibleField[]
```

Rules (as per RFC):

- Always include `summary`.
- Include `description` if template makes it visible OR `descriptionTemplate` exists.
- Include all fields with behavior `visible`.
- Do not show `preset` fields unless there is a conflict for that field.
- Add `now_required` conflict fields even if not present in template.
- Ignore `project`/`issuetype` fields.

## 5) Conflict detection / refresh

File: `/Users/shaowei/Projects/jira-boost/apps/extension/src/services/template-service/conflict-detection.ts`

```ts
export interface RefreshResult {
  conflicts: FieldConflict[]
  updatedCache: CachedFieldMetadata | null
}

export async function refreshAndDetectConflicts(
  template: IssueTemplate,
  jiraService: JiraService
): Promise<RefreshResult>

export function validatePresetValue(
  presetValue: unknown,
  allowedValues: AllowedValue[] | undefined,
  schema: JsonType
): boolean
```

Logic:

- Fetch fresh create meta fields for `(projectKey, issueTypeId)`.
- Detect:
  - field removed
  - preset value not in allowedValues
  - new required fields where template config missing or ignore
  - scope invalid (404)
- Return conflicts + updated cache.

## 6) Hooks

### `useTemplates`

File: `apps/extension/src/hooks/useTemplates.ts`

- React Query hook reading from TemplateService.

### `useFieldMetadataCache`

File: `apps/extension/src/hooks/useFieldMetadataCache.ts`

- reads local cache by key.

### `useCreateIssueForm`

File: `apps/extension/src/hooks/useCreateIssueForm.ts`

- load template + cache
- compute visible fields
- fire lazy refresh in background
- update conflicts and cache

## 7) Popup integration

### A) Popup open refresh

File: `/Users/shaowei/Projects/jira-boost/apps/extension/src/entrypoints/popup/App.tsx`

- Add a one-session guard and call:

```ts
getTemplateService().refreshForActiveSite({
  ttlMs: 24 * 60 * 60 * 1000,
  limit: 5
})
```

### B) TemplateMenu

File: `apps/extension/src/entrypoints/popup/menus/MainMenu/TemplateMenu.tsx`

- list matching templates
- show ⚠️ badge if `TemplateConflicts[template.id]` non-empty
- on select:
  - call `TemplateService.markTemplateUsed(template.id)`
  - navigate to CreateIssueMenu with `{templateId}`

### C) CreateIssueMenu

File: `apps/extension/src/entrypoints/popup/menus/MainMenu/CreateIssueMenu.tsx`

- uses `useCreateIssueForm`
- merges template preset fields + user form data
- calls existing create issue mutation
- handles reactive recovery on 400 by showing missing fields

## 8) Options integration

Create a Templates tab for CRUD.

- Options page pulls create meta fields when editing/creating a template so allowedValues pickers can be rendered.
- Saving a template stores only `FieldConfig` in sync and also writes field cache to local.

(Exact Options component integration depends on existing options routing; follow established patterns under `apps/extension/src/entrypoints/options`.)

---

# Integration Points (existing code)

The previous analysis referenced these files as existing integration surfaces:

Popup routing & menus:

- `/Users/shaowei/Projects/jira-boost/apps/extension/src/entrypoints/popup/App.tsx`
- `/Users/shaowei/Projects/jira-boost/apps/extension/src/entrypoints/popup/menus/MainMenu/MainMenu.tsx`
- `/Users/shaowei/Projects/jira-boost/apps/extension/src/entrypoints/popup/menus/MainMenu/ExtraActionsMenu.tsx`
- `/Users/shaowei/Projects/jira-boost/apps/extension/src/entrypoints/popup/menus/MainMenu/SearchResultMenu.tsx`

Jira services:

- `/Users/shaowei/Projects/jira-boost/apps/extension/src/lib/jira/api.ts`
- `/Users/shaowei/Projects/jira-boost/apps/extension/src/lib/jira/issues.ts`
- `/Users/shaowei/Projects/jira-boost/apps/extension/src/services/jira-service/jira-service.ts`

Storage:

- `/Users/shaowei/Projects/jira-boost/apps/extension/src/lib/storage/schema.ts`
- `/Users/shaowei/Projects/jira-boost/apps/extension/src/lib/storage/fromStorage.ts`

Follow existing patterns for:

- proxy services in `/apps/extension/src/services/*`
- typed storage in `/apps/extension/src/lib/storage/*`
- menus routing conventions in popup menus folder

---

# Implementation Order (TDD-first)

## Phase 0 — Validate RFC alignment

- [ ] Re-read `/specs/Fast Track Issue Template RFC.md` and ensure it matches this plan.

## Phase 1 — Types + storage

- [ ] Add `types/template.ts`.
- [ ] Extend `lib/storage/schema.ts` with new keys.
- [ ] Add minimal storage access helpers (if the repo uses wrappers).

## Phase 2 — Gap analysis (unit tests first)

- [ ] Write failing tests: `gap-analysis.test.ts`.
- [ ] Implement `computeVisibleFields`.

## Phase 3 — Conflict detection (unit tests first)

- [ ] Write failing tests: `conflict-detection.test.ts`.
- [ ] Implement `refreshAndDetectConflicts` + `validatePresetValue`.

## Phase 4 — TemplateService (integration tests first)

- [ ] Write failing tests for CRUD + `markTemplateUsed` + `refreshForActiveSite` selection (recent 5).
- [ ] Implement TemplateService using storage items.

## Phase 5 — Options UI (Template CRUD)

- [ ] Add Templates tab and editor.
- [ ] Ensure editor fetches Jira create meta fields for the scope.
- [ ] Save template + seed local FieldMetadataCache

## Phase 6 — Popup UI wiring

- [ ] Modify `popup/App.tsx` to trigger `refreshForActiveSite` once/session.
- [ ] Add TemplateMenu + CreateIssueMenu, integrate with MainMenu trigger.
- [ ] Ensure selecting template calls `markTemplateUsed`.

## Phase 7 — Field rendering components

- [ ] Implement FieldRenderer and per-type inputs.
- [ ] Ensure conflict styling + error messages.

## Phase 8 — Quality gates

- [ ] `pnpm lint`
- [ ] `pnpm typecheck`
- [ ] `pnpm test`

---

# Error Handling

1. **Offline / network error during refresh**
   - Do not block rendering; rely on cache and reactive recovery on submit.

2. **Jira scope invalid (404 project/issueType)**
   - Mark conflict `scope_invalid`; disable create flow; show message.

3. **Field removed**
   - Remove from rendering; keep template config but warn.

4. **Allowed values drift**
   - `preset_invalid` conflict; show field and force user selection.

5. **New required fields**
   - `now_required` conflict; show field.

6. **400 submit errors**
   - Parse `errors` map; add those fields to form (best-effort) and show messages.

7. **Storage quota**
   - Keep sync templates minimal; warn/limit template count (RFC suggests max 50).

---

# Testing Strategy

## Unit tests (Vitest)

- `computeVisibleFields`
  - always includes summary
  - hides preset when no conflict
  - shows preset when conflict exists
  - adds now_required conflicts

- `refreshAndDetectConflicts`
  - preset_invalid detection
  - now_required detection
  - field_removed detection
  - scope_invalid handling

## Integration tests

- `TemplateService` CRUD
- `markTemplateUsed` updates `lastUsedAt`
- `refreshForActiveSite`:
  - filters by active site
  - sorts by lastUsedAt
  - takes limit=5
  - respects TTL

## E2E (optional)

- Using existing extension e2e infra (if present): create template → use template → verify minimal fields → simulate drift.

---

# Decision Points (with rationale)

- **Hybrid storage**: sync templates minimal; local caches large.
- **Lazy-load reconciliation**: detect drift early and update form dynamically.
- **Popup-triggered refresh**: avoids wasteful background polling.
- **Refresh only recent 5 templates**: balances freshness with network/battery.

Alternatives:

- Background alarms (rejected) due to resource cost.
- Store full metadata in template (rejected) due to sync quota.

---

# Future Enhancements

- Support additional Jira field types (date/datetime/cascading select).
- Template import/export.
- Smarter cache invalidation (ETag if Jira supports).
- Per-template refresh indicator and manual “Refresh template metadata” button.
- Better validation for user-type preset values.
- Debounced/hybrid MRU to reduce sync writes.

---

# Implementation Progress

- [ ] Not started
