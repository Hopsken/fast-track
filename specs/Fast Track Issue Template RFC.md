# Technical RFC: Fast Track Issue Templates

| Attribute   | Value                                                                       |
| ----------- | --------------------------------------------------------------------------- |
| **RFC ID**  | RFC-2024-001                                                                |
| **Status**  | Draft                                                                       |
| **Author**  | Engineering Team                                                            |
| **Created** | 2024-01-28                                                                  |
| **PRD**     | [Fast Track Issue Template PRD](./Fast%20Track%20Issue%20Template%20PRD.md) |

## 1. Overview

### 1.1 Problem Statement

Users creating Jira issues through Fast Track face the same “form hell” as Jira Web: excessive required fields that are often repetitive for common scenarios (e.g., “Frontend Bug” always has the same Component, Labels, etc.).

### 1.2 Proposed Solution

Implement **Issue Templates** that allow users to:

1. Pre-configure field values for common issue creation scenarios
2. Trigger templates via keywords (e.g., `+febug`) in the popup command input
3. Only fill in the remaining required fields at runtime

### 1.3 Key Goals

- Template creation time: < 2 minutes
- Issue creation with template: < 5 seconds
- Zero-config for casual users (templates are optional power-user feature)

---

## 2. Architecture (High Level)

### 2.1 Components

- **Options Page (React)**
  - Template CRUD + editor
  - Scope selection (site → project → issue type)
  - Field behavior configuration per field: `preset | visible | ignore`

- **Popup (React)**
  - TemplateMenu: search by `+` / `C` prefix
  - CreateIssueForm: renders only visible fields immediately (no blocking API)

- **Background (Service Worker)**
  - TemplateService
    - CRUD templates
    - Field metadata cache management
    - Lazy refresh + conflict detection

- **Storage**
  - `chrome.storage.sync`: templates (small, cross-device)
  - `chrome.storage.local`: Jira field metadata cache + detected conflicts (large, instance-specific)

### 2.2 Data Flow (Contracts)

#### Template creation (Options)

```
User selects (site, project, issueType)
  -> fetch create-meta fields from Jira API
  -> user configures each field behavior
     - preset: store presetValue
     - visible: show at runtime
     - ignore: not used
  -> save
     - sync: IssueTemplate (only user config)
     - local: FieldMetadataCache (rendering hints)
```

#### Issue creation (Popup)

```
User types "+<keyword>"
  -> show TemplateMenu
  -> user selects template
  -> CreateIssueForm renders immediately from:
       - IssueTemplate (sync)
       - FieldMetadataCache (local)
       - TemplateConflicts (local; optional)
  -> in background: lazy refresh against Jira API
       - update cache
       - detect conflicts
       - if conflicts: promote fields to visible + show warning
  -> submit:
       payload = baseScopeFields + template.presets + userInput
  -> on 400 error: reactive recovery
       - parse error map
       - add missing fields to form
```

---

## 3. Data Model (Minimal)

> Principle: **sync storage stores only user intent; local storage stores cache/conflicts.**

### 3.1 IssueTemplate (sync)

```ts
// Contract only (pseudo-types)

IssueTemplate {
  id: UUID
  name: string
  trigger: string
  icon?: string

  scope: {
    siteUrl: string
    projectKey: string
    issueTypeId: string
    issueTypeName: string
  }

  // Only explicitly configured fields are stored.
  fields: Record<FieldId, FieldConfig>

  // Optional helper for description content
  description?: string

  createdAt: ISODateTime
  updatedAt: ISODateTime
  lastUsedAt?: ISODateTime
}

FieldConfig {
  behavior: 'preset' | 'visible' | 'ignore'
  presetValue?: JiraApiValue
}
```

### 3.2 FieldMetadataCache (local)

```ts
CachedFieldMetadata {
  cacheKey: `${siteUrl}:${projectKey}:${issueTypeId}`
  lastUpdated: ISODateTime
  fields: FieldMetadata[]
}

FieldMetadata {
  fieldId: string
  name: string
  required: boolean
  schema: { type: string; items?: string }
  allowedValues?: AllowedValue[]
  autoCompleteUrl?: string
}
```

### 3.3 Conflicts (local)

```ts
FieldConflict {
  fieldId: string
  type: 'preset_invalid' | 'now_required' | 'field_removed' | 'scope_invalid'
  message: string
  fieldMetadata?: FieldMetadata // from fresh API when needed for rendering
}
```

---

## 4. Core Contract Logic (Pseudo-code only)

### 4.1 Compute visible fields (no API required)

Key insight: **initial visible fields are derived purely from template configuration**.

```text
computeVisibleFields(template, cache?, conflicts?) -> VisibleField[]

visible = []

// Always
add(summary)

// Description
if template.description exists OR template.fields['description'].behavior == 'visible':
  add(description, presetValue=description)

// Configured fields
for each (fieldId, config) in template.fields:
  skip system scope fields: project, issuetype
  if config.behavior == 'visible':
    add(fieldId)
  else if config.behavior == 'preset' AND conflicts contains fieldId:
    // conflict-promoted preset field becomes visible
    add(fieldId, presetValue=config.presetValue, conflict=...)

// Conflict-promoted required fields
for each conflict in conflicts:
  if conflict.type == 'now_required' and fieldId not already visible:
    add(fieldId, conflict=...)

return visible
```

### 4.2 Lazy refresh + conflict detection (background)

```text
refreshAndDetectConflicts(template) -> { updatedCache, conflicts }

freshFields = JiraAPI.getCreateIssueFields(projectKey, issueTypeId)

conflicts = []

// 1) Config drift checks
for each (fieldId, config) in template.fields:
  fresh = freshFields[fieldId]

  if fresh missing and config.behavior != 'ignore':
    conflicts += { fieldId, type='field_removed' }

  if config.behavior == 'preset':
    if presetValue invalid under fresh.allowedValues/schema:
      conflicts += { fieldId, type='preset_invalid', fieldMetadata=fresh }

// 2) Newly required fields
for each freshField in freshFields where freshField.required:
  skip summary/project/issuetype
  if template.fields[freshField.fieldId] missing OR behavior == 'ignore':
    conflicts += { fieldId, type='now_required', fieldMetadata=freshField }

updatedCache = { cacheKey, lastUpdated=now, fields=freshFields }
return { updatedCache, conflicts }
```

### 4.3 Submit merge + reactive recovery

```text
onSubmit(template, userInput):
  presets = all template.fields where behavior == 'preset'

  payload = {
    project: { key: template.scope.projectKey },
    issuetype: { id: template.scope.issueTypeId },
    ...presets,
    ...userInput
  }

  result = JiraAPI.createIssue(payload)

  if result is 400 with errors map:
    // reactive recovery: show missing fields + messages
    promote errored fields to visible and re-render
```

---

## 5. Refresh Strategy (Popup-triggered)

No periodic polling.

- On popup open (once per popup session): refresh cache/conflicts for **recently used templates** on active site (guarded by TTL).
- On template selection / form load: start a best-effort `refreshAndDetectConflicts()` in background.
- If refresh fails: do not block; rely on cached metadata + reactive recovery on submit.

---

## 6. Error Handling (Contract)

| Situation         | Handling                                                     |
| ----------------- | ------------------------------------------------------------ |
| `preset_invalid`  | Promote field to visible + warn user                         |
| `now_required`    | Add field to form + warn user                                |
| `field_removed`   | Warn + ignore field at submit                                |
| `scope_invalid`   | Disable form + ask user to edit template scope               |
| Jira 400 `errors` | Parse errors map, promote missing fields, show inline errors |

---

## 7. Scope (MVP)

In scope:

- Template CRUD in Options
- Trigger templates via `+` / `C`
- preset / visible / ignore
- Render immediately from cache
- Lazy refresh conflict detection
- Reactive recovery on 400
- Storage split: sync templates, local cache/conflicts

Out of scope (Phase 2+):

- Date/DateTime, cascading select
- Import/export
- Extract-from-issue

---

## 8. Design Evolution & Final Implementation

### 8.1 Field Behavior Model Evolution

**Initial Design (RFC):**

```typescript
FieldConfig {
  behavior: 'preset' | 'visible' | 'ignore'
  presetValue?: JiraApiValue
}
```

**Implementation Reality (2025-01-31):**

The initial 3-way model proved insufficient during implementation. Key insight:

> **"Selected field with empty value" has two distinct use cases:**
>
> 1. Make non-required field visible (e.g., Description)
> 2. Restrict field to subset of options (e.g., limit Components)

**Final Model:**

```typescript
FieldConfig =
  | { behavior: 'visible' }                               // Show with all options
  | { behavior: 'preset'; presetValue: unknown }          // Auto-fill value
  | { behavior: 'restricted'; allowedOptions: AllowedValue[] }  // Limit choices
  | { behavior: 'ignore' }                                // Omitted (implicit)
```

**Key changes:**

- Added `restricted` behavior for limiting field options
- Unified `AllowedValue` shape for both Jira-provided and user-defined options
- Validation: preset must have value, restricted must have ≥1 option

### 8.2 User-Facing Design: 3-Way Toggle

**UI Model:**

```
[ Show | Fill | Limit ]
```

| Mode      | Behavior                 | Backend      | Use Case                |
| --------- | ------------------------ | ------------ | ----------------------- |
| **Show**  | All options available    | `visible`    | Add Description to form |
| **Fill**  | Auto-fill specific value | `preset`     | Default Priority = High |
| **Limit** | Restrict to subset       | `restricted` | Only 3 of 20 Components |

**Ignore** is handled by not adding the field to template (remove button instead of 4th toggle option).

### 8.3 Unified Field Option Model

**Problem:** Fields get options from two sources:

1. **Jira-provided:** Select, multi-select, priority → `field.allowedValues`
2. **User-defined:** Number (story points), text, user → manually entered

**Solution:** Single `AllowedValue` shape for both:

```typescript
type AllowedValue = {
  id: string // Jira's allowedValue.id OR nanoid(8) for user-defined
  name?: string // Display label
  value?: string // Simple value storage
  // ... other Jira fields (iconUrl, etc.)
}
```

**Examples:**

_Jira-provided (Priority):_

```typescript
{ behavior: 'restricted', allowedOptions: [
  { id: '1', name: 'Critical', iconUrl: '...' },
  { id: '2', name: 'High', iconUrl: '...' }
]}
```

_User-defined (Story Points):_

```typescript
{ behavior: 'restricted', allowedOptions: [
  { id: 'sp-k3j5h2', name: '1', value: '1' },
  { id: 'sp-m9n4p1', name: '2', value: '2' },
  { id: 'sp-q7r8s3', name: '3', value: '3' },
  { id: 'sp-t2v6w9', name: '5', value: '5' }
]}
```

**Architecture benefit:** Template storage, validation, and runtime code don't branch on option source. Only the config UI needs to know (has `field.allowedValues`).

### 8.4 Validation Strategy

**Principle:** Enforce, don't guess. Block save with clear errors instead of silent corrections.

**Rules:**

1. Preset mode → must have non-empty `presetValue`
2. Restricted mode → must have ≥1 option in `allowedOptions`

**Error format:**

```
Single: "Story Points: Preset value required. Set a value or switch to Show mode."

Multiple:
"3 validation errors:
• Story Points: Preset value required. Set a value or switch to Show mode.
• Components: At least one option required for restricted mode.
• Description: Preset value required. Set a value or switch to Show mode."
```

### 8.5 Field Type Support Matrix

| Field Type          | Jira Options? | Limit Mode UI                  | Status                  |
| ------------------- | ------------- | ------------------------------ | ----------------------- |
| Select/Multi-select | ✅ Yes        | Checkbox grid                  | ✅ Implemented          |
| Priority            | ✅ Yes        | Checkbox grid                  | ✅ Implemented          |
| Number              | ❌ No         | Chip input (validates numeric) | ✅ Implemented          |
| Text                | ❌ No         | Chip input (free-text)         | ✅ Implemented          |
| User                | ❌ No         | User search picker             | 🚧 Deferred (needs API) |

### 8.6 Implementation References

Full design documentation:

- **Design doc:** `apps/extension/docs/template-field-configuration.md`
- **Quick reference:** `apps/extension/docs/template-field-quick-reference.md`

Key files:

- Type schema: `src/types/template.ts`
- 3-way toggle: `src/entrypoints/options/routes/templates/template-wizard/FieldRow.tsx`
- Options input: `src/entrypoints/options/routes/templates/template-wizard/RestrictedOptionsInput.tsx`
- Validation: `src/entrypoints/options/routes/templates/template-wizard/context.tsx`

---

## 9. References

- [PRD: Fast Track Issue Templates](./Fast%20Track%20Issue%20Template%20PRD.md)
- [Jira REST API: Create Issue Meta](https://developer.atlassian.com/cloud/jira/platform/rest/v3/api-group-issues/#api-rest-api-3-issue-createmeta-get)
- [jira.js Documentation](https://mrrefactoring.github.io/jira.js/)
- [WXT Storage API](https://wxt.dev/guide/storage.html)
