---
date: 2026-01-29
title: Jira Templates Wizard And Scoped Crud
directory: /Users/shaowei/Projects/jira-boost
status: in-progress
dependencies: []
dependents: [fast-track-issue-templates]
---

# Goal / Overview

Build a new **Issue Template CRUD user flow** in the extension Options UI that:

- **Binds templates to the currently connected Jira instance automatically** (no manual Jira URL input).
- Creates templates through a **multi-step wizard**:
  1. select **Project** and **Issue Type**, then
  2. configure template basics (**Name** required) + **Description template** (v1).
- Uses **HashRouter routes** in Options:
  - `#/templates` list
  - `#/templates/new` wizard
  - `#/templates/:id` detail/edit
- Filters templates by the **current connection** by default, but supports auditing other-host templates via **Show others**.
- If a template’s Jira host does not match the current connection: show a **mismatch notice** and make the form **read-only**, while still allowing **Delete**.

Why: templates are intrinsically tied to a Jira instance; forcing users to input Jira URL/IDs is error-prone and a poor UX.

# Conversation Analysis (for implementer context)

## Main feature

Replace the current “Templates” tab (list + editor) with a route-based template module featuring a wizard, automatic binding to connected Jira host, and strong read-only behavior for cross-host templates.

## Discussed approaches (accepted and rejected)

- **Router**
  - Rejected: MemoryRouter (user corrected themselves).
  - Accepted: **HashRouter** because Options already uses `HashRouter`.

- **Template host binding**
  - Rejected: manual siteUrl input.
  - Accepted: derive from existing auth connection, but store only **hostname** (no protocol).

- **Wizard steps**
  - Accepted: multi-step creation.
  - Accepted for v1: 2 steps (no preview yet).
  - Deferred: field-level configuration UI and preview step.

- **Project + Issue Type selection**
  - Accepted: searchable selects.

- **Service for project APIs**
  - Decision: implement `listProjects` / `searchProjects` in **ProjectService** (even though it currently only tracks clicks).
  - Rationale: explicit user requirement.

- **Template ID generation**
  - Rejected: `crypto.randomUUID()`.
  - Accepted: **nanoid**.

- **Template type definition**
  - Rejected: ad-hoc TS interfaces only.
  - Accepted: **zod** schema as the source of truth.

- **Unconnected state**
  - Accepted: allow viewing.
  - Accepted: default list shows none (since no “current host”), but if others exist show a button to reveal them.
  - Accepted: cannot create when unconnected.

- **Cross-host templates**
  - Accepted: allow navigation to `#/templates/:id`.
  - Accepted: make read-only but allow deletion.

## Explicit agreements / decisions

- Template `name` is **user-entered** (required).
- `issueTypeName` is required and must be auto-populated (cannot be empty).
- Host binding key is **hostname only**.
- Reuse **AuthService.getCredentials()** to determine current host.
- Do not implement migration (assume no legacy templates in production).

## Open questions / decision points

None remaining for core v1, but implementer should verify:

- Where Jira project/issue type data is fetched from (APIs in Jira client). The plan below specifies the shape but implementer must choose the concrete Jira API calls based on existing Jira helpers.

# Dependencies

## New npm packages

- `nanoid` (in `apps/extension`) for template id generation.

## Existing dependencies used

- `zod` already used in repo.
- `react-router-dom` already used.
- `@tanstack/react-query` already used.

# File Structure

## Existing files to modify

- `/Users/shaowei/Projects/jira-boost/apps/extension/src/entrypoints/options/App.tsx`
  - Add new routes under `<Routes>` for templates module.

- `/Users/shaowei/Projects/jira-boost/apps/extension/src/entrypoints/options/components/TabNavigation.tsx`
  - Add a “Templates” tab entry.

- `/Users/shaowei/Projects/jira-boost/apps/extension/src/entrypoints/options/components/tabs/TemplatesTab.tsx`
  - Deprecated: will be replaced by route pages; either remove or keep but unused.

- `/Users/shaowei/Projects/jira-boost/apps/extension/src/types/template.ts`
  - Convert to Zod-driven types and update scope shape.

- `/Users/shaowei/Projects/jira-boost/apps/extension/src/services/template-service/index.ts`
  - Add nanoid id generation.
  - Validate read/write with zod.

- `/Users/shaowei/Projects/jira-boost/apps/extension/src/services/project-service/index.ts`
  - Add `listProjects`, `searchProjects`, and `getIssueTypesForProject` (or equivalent) as agreed.

- `/Users/shaowei/Projects/jira-boost/apps/extension/src/hooks/useTemplates.ts`
  - Keep but update query semantics if needed (now list page may need all templates vs filtered).

## New files to add

Suggested structure:

- `/Users/shaowei/Projects/jira-boost/apps/extension/src/entrypoints/options/routes/templates/TemplatesIndexPage.tsx`
- `/Users/shaowei/Projects/jira-boost/apps/extension/src/entrypoints/options/routes/templates/TemplateWizardPage.tsx`
- `/Users/shaowei/Projects/jira-boost/apps/extension/src/entrypoints/options/routes/templates/TemplateDetailPage.tsx`

- `/Users/shaowei/Projects/jira-boost/apps/extension/src/utils/normalize-host.ts` (or similar)

- Optional hooks:
  - `/Users/shaowei/Projects/jira-boost/apps/extension/src/hooks/useCurrentJiraHost.ts`
  - `/Users/shaowei/Projects/jira-boost/apps/extension/src/hooks/useProjectOptions.ts`

# Component Breakdown

## 1) Host resolution

### Utility

```ts
export function normalizeBaseUrlHost(input: string): string
```

Behavior:

- Accepts `https://xxx.atlassian.net`, `xxx.atlassian.net`, or URLs with paths.
- Returns lowercase hostname only.

### Hook (optional)

```ts
export function useCurrentJiraHost(): {
  host: string | null
  isLoading: boolean
  error: string | null
}
```

Uses `getAuthService().getCredentials()`; returns `credentials?.host` normalized.

## 2) Templates list page

File: `.../TemplatesIndexPage.tsx`

Responsibilities:

- Fetch current host.
- Fetch templates (all).
- Render:
  - Connected status
  - Create button (disabled if no host)
  - Default list: templates matching current host
  - “Show others” button if there exist other-host templates
  - If show others enabled: grouped list by host; entries navigate to detail route.

Key signatures:

```tsx
export function TemplatesIndexPage(): JSX.Element
```

UI behavior:

- If no host: default list is empty; show connect prompt; creation disabled.
- If show others enabled without host: show all grouped by `scope.baseUrlHost`.

## 3) Wizard page (2-step)

File: `.../TemplateWizardPage.tsx`

Steps:

### Step 1: select project + issue type

- Project select is searchable (backed by `ProjectService` list/search)
- Issue type select depends on chosen project; fetch issue types for that project.
- Issue type selection must yield both `issueTypeId` and non-empty `issueTypeName`.

### Step 2: template basics

- Name (required, user input)
- Description template (optional)

Save action:

- Inject `scope.baseUrlHost = currentHost`.
- Use `templateService.createTemplate`.
- Navigate to `#/templates/:id`.

Key types:

```ts
type WizardScope = {
  projectKey: string
  issueTypeId: string
  issueTypeName: string
}
```

Key component signature:

```tsx
export function TemplateWizardPage(): JSX.Element
```

Unconnected behavior:

- If `currentHost` is null: render a blocked state and link back to list; do not allow creation.

## 4) Template detail page

File: `.../TemplateDetailPage.tsx`

Responsibilities:

- Load template by id.
- Load current host.
- Determine read-only:

```ts
const readOnly = !currentHost || template.scope.baseUrlHost !== currentHost
```

Behavior:

- If readOnly: show a prominent mismatch notice.
- Inputs are `readOnly` (preferred for copy) and Save is disabled/hidden.
- Delete is still available, using AlertDialog.

Key signature:

```tsx
export function TemplateDetailPage(): JSX.Element
```

## 5) Template form component(s)

Optional extraction to share between wizard step2 and detail:

```tsx
type TemplateFormValues = {
  name: string
  descriptionTemplate: string
}

export function TemplateBasicsForm(props: {
  values: TemplateFormValues
  onChange: (next: TemplateFormValues) => void
  readOnly?: boolean
}): JSX.Element
```

# Integration Points

## Options routing

- Modify `/apps/extension/src/entrypoints/options/App.tsx` to add new routes:

```tsx
<Route path="/templates" element={<TemplatesIndexPage />} />
<Route path="/templates/new" element={<TemplateWizardPage />} />
<Route path="/templates/:id" element={<TemplateDetailPage />} />
```

Also add a default redirect if needed.

## Tab navigation

- Add `{ id: 'templates', label: 'Templates', icon: ... }` to `tabs` in `TabNavigation.tsx`.

## Auth service

- Use existing `AuthService.getCredentials()` in `/apps/extension/src/services/auth-service.ts`.
- Credentials contain `host` which looks like a normalized URL with protocol; must be converted to hostname.

## Template service

- Existing service at `/apps/extension/src/services/template-service/index.ts`.
- Currently uses `crypto.randomUUID()` and returns whatever storage holds.
- Must be changed to use nanoid and zod validation.

## Project service

- Existing service at `/apps/extension/src/services/project-service/index.ts`.
- Must be extended with Jira data access for listing/searching projects and fetching issue types.
- Implementer must choose which Jira helper to use (e.g., `JiraAPI` or existing jira.js wrappers) based on codebase.

# Implementation Order (step-by-step)

## Step 1

- [x] **(TDD)** Add tests for new template schema validation (issueTypeName required; baseUrlHost host-only).
- [x] Add `normalizeBaseUrlHost()` util.
- [x] Refactor `/apps/extension/src/types/template.ts` to Zod-based schemas + inferred types:
  - Rename scope field from `siteUrl` to `baseUrlHost` (hostname-only).
  - Keep other existing fields in IssueTemplate shape (trigger/icon/fields/lastUsedAt) as pass-through for now.

## Step 2

- [x] Update `TemplateServiceImpl`:
  - [x] Use `nanoid()` for IDs.
  - [x] Validate templates read from storage with zod; skip invalid.
  - [x] Validate on create/update.

## Step 3

- [ ] Extend `ProjectServiceImpl`:
  - [ ] `listProjects(): Promise<Array<{ key: string; name: string }>>`
  - [ ] `searchProjects(query: string): Promise<Array<{ key: string; name: string }>>`
  - [ ] `getIssueTypesForProject(projectKey: string): Promise<Array<{ id: string; name: string }>>`
  - [ ] Add tests using mocked Jira layer.

## Step 4

- [ ] Build new Options routes + pages:
  - [ ] Add Templates tab to `TabNavigation.tsx`.
  - [ ] Add routes to `App.tsx`.
  - [ ] Implement `TemplatesIndexPage`.
  - [ ] Implement `TemplateWizardPage` (2 steps, name required).
  - [ ] Implement `TemplateDetailPage` (read-only mismatch + delete).

## Step 5

- [ ] Remove or orphan old tab-based Templates UI (`TemplatesTab.tsx`, `TemplateEditor.tsx`, `TemplateList.tsx`) or keep but unused; ensure no dead route links.
- [ ] Run quality gates: `pnpm lint`, `pnpm typecheck`, `pnpm test`.

# Error Handling / Edge Cases

- **No auth credentials**:
  - List page loads; creation disabled; default list empty.
  - Show “Show others” toggle if other-host templates exist; if enabled, show all grouped.

- **Template not found** (`#/templates/:id`):
  - Show a not-found state with link back to templates list.

- **Host mismatch**:
  - Render mismatch notice.
  - Form is read-only.
  - Delete allowed.

- **Issue type name missing**:
  - Wizard blocks progression/save.
  - Zod schema rejects save if empty.

- **Jira API errors** when listing/searching projects or loading issue types:
  - Show inline error near the selects.
  - Keep UI responsive (loading states on selects).

- **Invalid templates in storage**:
  - `listTemplates` should skip invalid entries and not crash Options UI.

# Testing Strategy

## Unit tests

- Template schema tests:
  - `IssueTemplateScopeSchema` requires non-empty `issueTypeName`.
  - host normalization produces hostname.

- Template service tests:
  - create uses nanoid and timestamps.
  - list skips invalid entries.
  - update preserves required fields.

- Project service tests:
  - list/search projects returns normalized shape.
  - issue types fetch returns `{id,name}`.
  - error propagation.

## Minimal UI tests (optional)

- Wizard gating (cannot proceed without project+issueType and name).
- Detail read-only when mismatch.

# Decision Points (with rationale)

- **HashRouter** chosen because Options already uses it; avoids large routing refactor.
- **Host-only binding** (`baseUrlHost`) avoids protocol differences and ensures stable filtering.
- **Zod** as source of truth prevents invalid template data from breaking UI and enforces non-empty `issueTypeName`.
- **nanoid** for IDs provides deterministic, compact IDs vs UUID.
- **ProjectService expansion** is chosen per explicit user request, despite current narrower responsibility.
- **Show others** supports auditing templates from different Jira instances.

# Future Enhancements (explicitly deferred)

- Step 3 “Preview” before saving.
- Field-level configuration (preset/visible/ignore) driven by create-meta.
- Better loading skeletons.
- Ability to switch between connected instances (multi-site) rather than audit-only.
- Migration of old `siteUrl` templates (currently out-of-scope).

# Implementation Progress

- [x] Step 1 (TDD): Added failing schema validation tests for the upcoming Zod template scope schema.
  - Added: `apps/extension/src/types/template.schema.test.ts`
  - Covers: `issueTypeName` must be non-empty; `baseUrlHost` must be hostname-only (no protocol/path)
  - Note/deviation: introduced a temporary `IssueTemplateScopeSchema` export stub in `apps/extension/src/types/template.ts` so the test suite compiles. The tests currently fail (expected) until the schema is tightened in later steps.

- [x] Step 2: Added host normalization utility.
  - Added: `apps/extension/src/utils/normalize-host.ts` (`normalizeBaseUrlHost(input: string): string`)
  - Added tests: `apps/extension/src/utils/normalize-host.test.ts`
  - Behavior: accepts full URLs, host-only strings, and URLs with paths; returns lowercase hostname; returns empty string for invalid input.

- [x] Step 3: Refactored template types to be Zod-driven and renamed scope binding to hostname-only.
  - Rewrote: `apps/extension/src/types/template.ts`
    - Added Zod schemas as source of truth: `IssueTemplateScopeSchema`, `IssueTemplateSchema`, etc.
    - Renamed scope field: `siteUrl` -> `baseUrlHost`
    - Enforced validations needed by v1:
      - `issueTypeName` is required + non-empty
      - `baseUrlHost` rejects protocol/path/fragments (hostname-only)
  - Updated call sites to keep the repo compiling (mechanical rename):
    - `apps/extension/src/services/template-service/index.test.ts`
    - `apps/extension/src/services/template-service/gap-analysis.test.ts`
    - Legacy Options tab UI (will be removed/orphaned later):
      - `apps/extension/src/entrypoints/options/components/tabs/TemplateEditor.tsx`
      - `apps/extension/src/entrypoints/options/components/tabs/TemplatesTab.tsx`
  - Verification: ran `vitest` for the schema + template-service tests; they now pass.

- [x] Step 4: Updated `TemplateServiceImpl` to generate IDs via nanoid and validate with Zod.
  - Updated: `apps/extension/src/services/template-service/index.ts`
    - `createTemplate` now uses `nanoid()` instead of `crypto.randomUUID()`.
    - `getTemplates` validates entries with `IssueTemplateSchema`; invalid templates are skipped.
    - `createTemplate`/`updateTemplate` validate the persisted object; throws on invalid.
    - `getTemplate`/`deleteTemplate` now operate on the validated list (invalid entries are implicitly ignored/dropped).
  - Updated/added tests: `apps/extension/src/services/template-service/index.test.ts`
    - Added coverage for skipping invalid templates in storage.
    - Added coverage that create rejects invalid input.
    - Note: tests now explicitly clear shared fake storage between runs.
  - Fix during this step: adjusted `IssueTemplateSchema.fields` to use `z.record(z.string(), FieldConfigSchema)` (Zod v4 record signature) so field configs validate correctly.
