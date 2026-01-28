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

Users creating Jira issues through Fast Track face the same "form hell" as Jira Web: excessive required fields that are often repetitive for common scenarios (e.g., "Frontend Bug" always has the same Component, Labels, etc.).

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

## 2. Architecture

### 2.1 High-Level Component Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                           POPUP (React)                             │
├─────────────────────────────────────────────────────────────────────┤
│  MainMenu                                                           │
│  ├─ TicketListMenu (default)                                        │
│  ├─ ExtraActionsMenu (when search starts with "/")                  │
│  └─ TemplateMenu (NEW: when search starts with "C" or "+")          │
│      ├─ TemplateList → select template → push to CreateIssueForm    │
│      └─ CreateIssueForm (NEW) → render visible fields → submit      │
└─────────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      BACKGROUND (Service Workers)                   │
├─────────────────────────────────────────────────────────────────────┤
│  TemplateService (NEW)                                              │
│  ├─ CRUD operations on templates                                    │
│  ├─ refreshFieldMetadataCache() → update local cache                │
│  ├─ detectConflicts() → compare template vs fresh API data          │
│  └─ refreshForActiveSite() → popup-triggered cache/conflict refresh │
│                                                                     │
│  JiraService (existing)                                             │
│  ├─ getCreateIssueMetaIssueTypes() → list issue types for project   │
│  ├─ getCreateIssueMetaIssueTypeId() → get fields for issue type     │
│  └─ createIssue() → submit issue                                    │
└─────────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│                              STORAGE                                │
├─────────────────────────────────────────────────────────────────────┤
│  chrome.storage.sync (跨设备同步，体积小)                            │
│  ├─ IssueTemplates: IssueTemplate[]  (用户配置，无 schema)          │
│                                                                     │
│  chrome.storage.local (本地缓存，体积大)                             │
│  ├─ FieldMetadataCache: Record<cacheKey, CachedFieldMetadata>       │
│  └─ TemplateConflicts: Record<templateId, FieldConflict[]>          │
└─────────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         OPTIONS PAGE (React)                        │
├─────────────────────────────────────────────────────────────────────┤
│  TabNavigation                                                      │
│  ├─ GeneralTab                                                      │
│  ├─ TemplatesTab (NEW) → TemplateManager                            │
│  │   ├─ TemplateList                                                │
│  │   └─ TemplateEditor (create/edit template)                       │
│  ├─ LicenseTab                                                      │
│  └─ AboutTab                                                        │
└─────────────────────────────────────────────────────────────────────┘
```

### 2.2 Data Flow: Template Creation (Options Page)

```
[User selects Project + Issue Type]
        │
        ▼
[Call Jira API: getCreateIssueMetaIssueTypeId]
        │
        ▼
[Display all fields with behavior options]
   ├─ For each field: preset | visible | ignore
   └─ If preset: show value picker (using allowedValues from API)
        │
        ▼
[User configures fields and saves]
        │
        ▼
[Save to storage]
   ├─ sync: IssueTemplate (只存 fieldId + behavior + presetValue)
   └─ local: FieldMetadataCache (存 schema, allowedValues, required 等)
```

### 2.3 Data Flow: Issue Creation (Popup)

```
[User types "+febug" in popup]
        │
        ▼
[MainMenu detects prefix, renders TemplateMenu]
        │
        ▼
[TemplateMenu shows matching templates]
        │
        ▼
[User selects template]
        │
        ▼
[CreateIssueForm loads]
   ├─ Read IssueTemplate from sync storage
   ├─ Read FieldMetadataCache from local storage (for rendering)
   ├─ Compute visibleFields from template.fields (无需 API)
   └─ Render form immediately
        │
        ├─────────────────────────────────┐
        │                                 │
        ▼                                 ▼
[User fills form]              [Background: Lazy Refresh]
        │                         ├─ Call Jira API
        │                         ├─ Compare with template
        │                         └─ If conflicts detected:
        │                              └─ Update form dynamically
        │                                   ├─ preset_invalid → show field
        │                                   ├─ now_required → show field
        │                                   └─ Show warning alert
        │
        ▼
[User submits]
        │
        ▼
[Merge: template.presets + formData → createIssue()]
        │
        ├─ Success → toast + return to main menu
        └─ 400 Error → Reactive Recovery
             ├─ Parse error.errors
             ├─ Add missing fields to form
             └─ Show error messages
```

---

## 3. Data Model

### 3.1 IssueTemplate (sync storage - 精简版)

```typescript
// apps/extension/src/types/template.ts

/**
 * Issue template stored in sync storage.
 * Only contains user configuration, no Jira schema data.
 * This keeps the template small for cross-device sync.
 */
interface IssueTemplate {
  /** UUID v4 */
  id: string

  /** Display name, e.g., "Frontend Bug" */
  name: string

  /** Trigger keyword for quick access, e.g., "febug" */
  trigger: string

  /** Optional emoji or icon identifier */
  icon?: string

  /** Scope anchor - determines which Jira project/type this applies to */
  scope: TemplateScope

  /**
   * Field configurations - the core of the template
   * Key: Jira field ID (e.g., "components", "customfield_10021")
   * Value: User's configuration for this field
   *
   * Note: Only fields explicitly configured are stored.
   * Fields not in this map default to 'ignore' behavior.
   */
  fields: Record<string, FieldConfig>

  /** Optional markdown template for description field */
  descriptionTemplate?: string

  /** Metadata */
  createdAt: string // ISO timestamp
  updatedAt: string // ISO timestamp

  /**
   * Updated when the user uses this template to create an issue.
   * Used to decide “recently used” templates for popup-triggered refresh.
   */
  lastUsedAt?: string // ISO timestamp
}

interface TemplateScope {
  /** Jira site URL, e.g., "https://company.atlassian.net" */
  siteUrl: string
  /** Project key, e.g., "PROJ" */
  projectKey: string
  /** Issue type ID (not name, for stability) */
  issueTypeId: string
  /** Cached issue type name for display */
  issueTypeName: string
}

/**
 * User's configuration for a single field.
 * This is intentionally minimal - no schema info.
 */
interface FieldConfig {
  /**
   * How this field should behave:
   * - 'preset': Use presetValue, hide from form (unless overridden by conflict)
   * - 'visible': Show in form for user to fill
   * - 'ignore': Skip this field entirely
   */
  behavior: 'preset' | 'visible' | 'ignore'

  /**
   * The preset value in Jira API format.
   * Only used when behavior === 'preset'
   */
  presetValue?: unknown
}
```

### 3.2 FieldMetadataCache (local storage)

```typescript
// apps/extension/src/types/template.ts

/**
 * Cached field metadata from Jira API.
 * Stored in local storage (not synced) because:
 * 1. Can be large (allowedValues can have 100+ items)
 * 2. Can be regenerated from API
 * 3. May differ between Jira instances
 */
interface CachedFieldMetadata {
  /** Cache key: `${siteUrl}:${projectKey}:${issueTypeId}` */
  cacheKey: string

  /** When this cache was last refreshed */
  lastUpdated: string // ISO timestamp

  /** Field metadata from Jira API */
  fields: FieldMetadata[]
}

/**
 * Field metadata needed for rendering and validation.
 * Subset of Jira's FieldCreateMetadata.
 */
interface FieldMetadata {
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

interface JsonType {
  type: string // "string", "array", "option", "user", etc.
  items?: string // For arrays, the item type
  system?: string // System field name
  custom?: string // Custom field URI
  customId?: number // Custom field ID
}

interface AllowedValue {
  id: string
  name?: string
  value?: string
  iconUrl?: string
  [key: string]: unknown
}
```

### 3.3 Conflict Detection Types

```typescript
// apps/extension/src/types/template.ts

/**
 * Represents a conflict detected between template and current Jira state.
 * Used to dynamically update the form.
 */
interface FieldConflict {
  fieldId: string
  fieldName: string
  type: ConflictType
  message: string
  /** The field metadata from fresh API (for rendering) */
  fieldMetadata?: FieldMetadata
}

type ConflictType =
  /** Preset value is no longer in allowedValues */
  | 'preset_invalid'
  /** Field was 'ignore' but is now required */
  | 'now_required'
  /** Field no longer exists in Jira */
  | 'field_removed'
  /** Project or issue type no longer exists */
  | 'scope_invalid'
```

### 3.4 Storage Schema Extension

```typescript
// apps/extension/src/lib/storage/schema.ts

type StorageItems = {
  // ... existing items

  // ===== SYNC STORAGE (跨设备同步) =====

  /** User-created issue templates */
  IssueTemplates: IssueTemplate[]

  // ===== LOCAL STORAGE (本地缓存) =====

  /**
   * Cached field metadata from Jira API
   * Key: `${siteUrl}:${projectKey}:${issueTypeId}`
   */
  FieldMetadataCache: Record<string, CachedFieldMetadata>

  /**
   * Detected conflicts for templates
   * Updated by lazy refresh during form load
   */
  TemplateConflicts: Record<string, FieldConflict[]>
}

// Storage definitions
const issueTemplatesItem = storage.defineItem<IssueTemplate[]>(
  'sync:IssueTemplates',
  { fallback: [] }
)

const fieldMetadataCacheItem = storage.defineItem<
  Record<string, CachedFieldMetadata>
>('local:FieldMetadataCache', { fallback: {} })

const templateConflictsItem = storage.defineItem<
  Record<string, FieldConflict[]>
>('local:TemplateConflicts', { fallback: {} })
```

**Storage Constraints:**

| Storage Type | Limit        | Usage                                  |
| ------------ | ------------ | -------------------------------------- |
| sync         | 100KB total  | Templates only (~50 templates max)     |
| sync         | 8KB per item | Each template < 2KB typical            |
| local        | 10MB total   | Field cache + conflicts (plenty room)  |

---

## 4. Technical Specifications

### 4.1 Gap Analysis Algorithm (Template-Based)

The key insight: **visible fields can be computed purely from `template.fields`**, without calling Jira API at runtime.

```typescript
// apps/extension/src/services/template-service/gap-analysis.ts

interface VisibleField {
  fieldId: string
  /** From cache, for rendering */
  metadata?: FieldMetadata
  /** Value from template if preset but overridable */
  presetValue?: unknown
  /** Whether user can edit (visible fields are editable, conflict-promoted fields are editable) */
  isEditable: boolean
  /** If this field was added due to conflict */
  conflict?: FieldConflict
}

/**
 * Compute visible fields from template configuration.
 * This is the primary computation - no API call needed.
 *
 * @param template - The issue template
 * @param cache - Cached field metadata (for rendering hints)
 * @param conflicts - Any detected conflicts (from lazy refresh)
 */
function computeVisibleFields(
  template: IssueTemplate,
  cache?: CachedFieldMetadata,
  conflicts?: FieldConflict[]
): VisibleField[] {
  const visible: VisibleField[] = []
  const conflictMap = new Map(conflicts?.map((c) => [c.fieldId, c]))

  // 1. Summary is always visible (required by Jira)
  visible.push({
    fieldId: 'summary',
    metadata: cache?.fields.find((f) => f.fieldId === 'summary'),
    isEditable: true
  })

  // 2. Description - use template if provided
  const descConfig = template.fields['description']
  if (descConfig?.behavior === 'visible' || template.descriptionTemplate) {
    visible.push({
      fieldId: 'description',
      metadata: cache?.fields.find((f) => f.fieldId === 'description'),
      presetValue: template.descriptionTemplate,
      isEditable: true
    })
  }

  // 3. Process template.fields
  for (const [fieldId, config] of Object.entries(template.fields)) {
    if (fieldId === 'summary' || fieldId === 'description') continue
    if (fieldId === 'project' || fieldId === 'issuetype') continue

    const metadata = cache?.fields.find((f) => f.fieldId === fieldId)
    const conflict = conflictMap.get(fieldId)

    // Visible fields are always shown
    if (config.behavior === 'visible') {
      visible.push({
        fieldId,
        metadata,
        isEditable: true,
        conflict
      })
      continue
    }

    // Preset fields with conflicts become visible
    if (config.behavior === 'preset' && conflict) {
      visible.push({
        fieldId,
        metadata: conflict.fieldMetadata ?? metadata,
        presetValue: config.presetValue, // Show current (invalid) value
        isEditable: true,
        conflict
      })
      continue
    }

    // Preset fields without conflicts stay hidden (handled at submit)
  }

  // 4. Add conflict-promoted fields (fields that became required)
  for (const conflict of conflicts ?? []) {
    if (conflict.type === 'now_required') {
      const alreadyVisible = visible.some((f) => f.fieldId === conflict.fieldId)
      if (!alreadyVisible) {
        visible.push({
          fieldId: conflict.fieldId,
          metadata: conflict.fieldMetadata,
          isEditable: true,
          conflict
        })
      }
    }
  }

  return visible
}
```

### 4.2 Lazy Refresh & Conflict Detection

```typescript
// apps/extension/src/services/template-service/conflict-detection.ts

interface RefreshResult {
  conflicts: FieldConflict[]
  updatedCache: CachedFieldMetadata
}

/**
 * Refresh field metadata from Jira API and detect conflicts.
 * Called in background when CreateIssueForm loads.
 */
async function refreshAndDetectConflicts(
  template: IssueTemplate,
  jiraService: JiraService
): Promise<RefreshResult> {
  const { projectKey, issueTypeId, siteUrl } = template.scope
  const conflicts: FieldConflict[] = []

  // 1. Fetch fresh field metadata from Jira
  let freshFields: FieldMetadata[]
  try {
    const response = await jiraService.getCreateIssueMetaIssueTypeId({
      projectIdOrKey: projectKey,
      issueTypeId
    })
    freshFields = response.fields ?? []
  } catch (error) {
    // Project or issue type might not exist anymore
    if (error.status === 404) {
      conflicts.push({
        fieldId: '_scope',
        fieldName: 'Template Scope',
        type: 'scope_invalid',
        message: `Project ${projectKey} or issue type no longer exists`
      })
      return { conflicts, updatedCache: null }
    }
    throw error
  }

  const freshFieldMap = new Map(freshFields.map((f) => [f.fieldId, f]))

  // 2. Check each configured field for conflicts
  for (const [fieldId, config] of Object.entries(template.fields)) {
    const freshField = freshFieldMap.get(fieldId)

    // Field removed from Jira
    if (!freshField) {
      if (config.behavior !== 'ignore') {
        conflicts.push({
          fieldId,
          fieldName: fieldId,
          type: 'field_removed',
          message: `Field no longer exists in Jira`
        })
      }
      continue
    }

    // Preset value no longer valid
    if (config.behavior === 'preset' && config.presetValue !== undefined) {
      const isValid = validatePresetValue(
        config.presetValue,
        freshField.allowedValues,
        freshField.schema
      )
      if (!isValid) {
        conflicts.push({
          fieldId,
          fieldName: freshField.name,
          type: 'preset_invalid',
          message: `Preset value is no longer available`,
          fieldMetadata: freshField
        })
      }
    }
  }

  // 3. Check for new required fields not in template
  for (const freshField of freshFields) {
    if (!freshField.required) continue
    if (freshField.fieldId === 'summary') continue // Always handled
    if (freshField.fieldId === 'project' || freshField.fieldId === 'issuetype')
      continue

    const config = template.fields[freshField.fieldId]

    // Required field is ignored or not configured
    if (!config || config.behavior === 'ignore') {
      conflicts.push({
        fieldId: freshField.fieldId,
        fieldName: freshField.name,
        type: 'now_required',
        message: `This field is now required`,
        fieldMetadata: freshField
      })
    }
  }

  // 4. Update cache
  const cacheKey = `${siteUrl}:${projectKey}:${issueTypeId}`
  const updatedCache: CachedFieldMetadata = {
    cacheKey,
    lastUpdated: new Date().toISOString(),
    fields: freshFields
  }

  return { conflicts, updatedCache }
}

/**
 * Validate a preset value against current allowedValues.
 */
function validatePresetValue(
  presetValue: unknown,
  allowedValues: AllowedValue[] | undefined,
  schema: JsonType
): boolean {
  if (!allowedValues || allowedValues.length === 0) {
    // No allowedValues means any value is OK (e.g., string fields)
    return true
  }

  // For single select: check if value.id is in allowedValues
  if (schema.type === 'option' || schema.type === 'priority') {
    const valueId = (presetValue as { id?: string })?.id
    return allowedValues.some((av) => av.id === valueId)
  }

  // For multi-select arrays: check all items
  if (schema.type === 'array' && Array.isArray(presetValue)) {
    return presetValue.every((item) => {
      const itemId = (item as { id?: string })?.id
      return allowedValues.some((av) => av.id === itemId)
    })
  }

  // For user fields: we can't validate without API call, assume OK
  if (schema.type === 'user') {
    return true
  }

  return true
}
```

### 4.3 CreateIssueForm Hook

```typescript
// apps/extension/src/hooks/useCreateIssueForm.ts

interface UseCreateIssueFormOptions {
  templateId: string
}

interface UseCreateIssueFormResult {
  /** Visible fields to render */
  visibleFields: VisibleField[]
  /** Current conflicts (may update after lazy refresh) */
  conflicts: FieldConflict[]
  /** Is lazy refresh in progress */
  isRefreshing: boolean
  /** Form is ready to render (has cache or refresh completed) */
  isReady: boolean
  /** Template data */
  template: IssueTemplate | null
}

function useCreateIssueForm({
  templateId
}: UseCreateIssueFormOptions): UseCreateIssueFormResult {
  const { data: template } = useTemplate(templateId)
  const [conflicts, setConflicts] = useState<FieldConflict[]>([])
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Get cached field metadata
  const cacheKey = template
    ? `${template.scope.siteUrl}:${template.scope.projectKey}:${template.scope.issueTypeId}`
    : null
  const { data: cache } = useFieldMetadataCache(cacheKey)

  // Compute visible fields (immediate, from template + cache)
  const visibleFields = useMemo(() => {
    if (!template) return []
    return computeVisibleFields(template, cache, conflicts)
  }, [template, cache, conflicts])

  // Lazy refresh: fetch fresh data in background
  useEffect(() => {
    if (!template) return

    let cancelled = false
    setIsRefreshing(true)

    refreshAndDetectConflicts(template, getJiraService())
      .then(({ conflicts: newConflicts, updatedCache }) => {
        if (cancelled) return

        // Update conflicts (will re-render form if needed)
        setConflicts(newConflicts)

        // Update cache for future use
        if (updatedCache) {
          updateFieldMetadataCache(cacheKey, updatedCache)
        }

        // Persist conflicts for background validation display
        updateTemplateConflicts(templateId, newConflicts)
      })
      .catch((error) => {
        console.error('Failed to refresh field metadata:', error)
        // Don't block form - user can still try to submit
      })
      .finally(() => {
        if (!cancelled) setIsRefreshing(false)
      })

    return () => {
      cancelled = true
    }
  }, [template, templateId, cacheKey])

  return {
    visibleFields,
    conflicts,
    isRefreshing,
    isReady: !!template && (!!cache || !isRefreshing),
    template
  }
}
```

### 4.4 Jira API Integration

#### 4.4.1 Fetching Issue Types for a Project

```typescript
// Method: client.issues.getCreateIssueMetaIssueTypes
// Returns: PageOfCreateMetaIssueTypes

interface PageOfCreateMetaIssueTypes {
  issueTypes?: IssueTypeIssueCreateMetadata[]
  maxResults?: number
  startAt?: number
  total?: number
}

interface IssueTypeIssueCreateMetadata {
  id?: string
  name?: string
  description?: string
  iconUrl?: string
  subtask?: boolean
}
```

#### 4.4.2 Fetching Fields for an Issue Type

```typescript
// Method: client.issues.getCreateIssueMetaIssueTypeId
// Returns: PageOfCreateMetaIssueTypeWithField

interface PageOfCreateMetaIssueTypeWithField {
  fields?: FieldCreateMetadata[]
  maxResults?: number
  startAt?: number
  total?: number
}
```

#### 4.4.3 Creating an Issue

```typescript
// Method: client.issues.createIssue

interface CreateIssue {
  fields: {
    summary: string
    project: { key: string } | { id: string }
    issuetype: { id: string } | { name: string }
    [key: string]: unknown
  }
}
```

### 4.5 Field Type Mapping

| Jira Schema Type             | React Component         | Notes                              |
| ---------------------------- | ----------------------- | ---------------------------------- |
| `string`                     | `<Input>`               | Direct mapping                     |
| `string` + `custom:textarea` | `<Textarea>`            | Multiline input                    |
| `number`                     | `<Input type="number">` | Numeric validation                 |
| `option`                     | `<Combobox>` (single)   | From `allowedValues`               |
| `priority`                   | `<Combobox>` (single)   | Priority icons                     |
| `array` of `string`          | `<TagInput>`            | Labels                             |
| `array` of `option`          | `<Combobox>` (multi)    | Components, Versions               |
| `user`                       | `<UserPicker>`          | Autocomplete via `autoCompleteUrl` |
| `date`                       | _(Phase 2)_             | Not in MVP                         |
| `datetime`                   | _(Phase 2)_             | Not in MVP                         |
| `cascadingselect`            | _(Phase 2)_             | Dual combobox                      |

### 4.6 Services

#### 4.6.1 TemplateService

```typescript
// apps/extension/src/services/template-service/index.ts

import { defineProxyService } from '@webext-core/proxy-service'

class TemplateServiceImpl {
  // ===== CRUD =====
  async getTemplates(): Promise<IssueTemplate[]>
  async getTemplate(id: string): Promise<IssueTemplate | null>
  async createTemplate(
    input: Omit<IssueTemplate, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<IssueTemplate>
  async updateTemplate(
    id: string,
    updates: Partial<IssueTemplate>
  ): Promise<IssueTemplate>
  async deleteTemplate(id: string): Promise<void>

  // ===== Query =====
  async findTemplatesByTrigger(trigger: string): Promise<IssueTemplate[]>
  async findTemplatesForCurrentSite(): Promise<IssueTemplate[]>

  // ===== Cache Management =====
  async getFieldMetadataCache(cacheKey: string): Promise<CachedFieldMetadata | null>
  async updateFieldMetadataCache(
    cacheKey: string,
    cache: CachedFieldMetadata
  ): Promise<void>

  // ===== Conflict Management =====
  async getTemplateConflicts(templateId: string): Promise<FieldConflict[]>
  async updateTemplateConflicts(
    templateId: string,
    conflicts: FieldConflict[]
  ): Promise<void>

  // ===== Validation (Background) =====
  async refreshAllTemplates(): Promise<void>
}

export const [registerTemplateService, getTemplateService] = defineProxyService<
  TemplateServiceImpl,
  []
>('TemplateService', () => new TemplateServiceImpl())
```

#### 4.6.2 Extend JiraService

```typescript
// apps/extension/src/lib/jira/issues.ts (additions)

class JiraIssueService {
  // ... existing methods

  /** Get issue types available for creation in a project */
  async getCreateIssueTypes(
    projectKey: string
  ): Promise<IssueTypeIssueCreateMetadata[]>

  /** Get fields available for an issue type */
  async getCreateIssueFields(
    projectKey: string,
    issueTypeId: string
  ): Promise<FieldCreateMetadata[]>

  /** Create a new issue */
  async createIssue(fields: Record<string, unknown>): Promise<CreatedIssue>
}
```

### 4.7 Validation Strategy: Popup-Triggered (No Periodic Polling)

Periodic background polling (e.g. hourly alarms) is wasteful for this feature because:
- Templates are used opportunistically (not continuously)
- Jira metadata changes relatively infrequently
- Refreshing every hour costs network + battery and can wake service workers

**Decision:** Replace periodic alarms with a **popup-triggered refresh** strategy.

#### When do we refresh?

- **On popup open (once per session):**
  - Refresh the *current site*'s relevant `FieldMetadataCache` in the background.
  - Pre-compute / update `TemplateConflicts` for the **most recently used 5 templates** on the active Jira site.
  - Use a **TTL** to avoid refreshing too often (e.g. 24h) and a **session guard** to avoid multiple refreshes in the same popup session.

- **On template selection / CreateIssueForm load:**
  - Always start `refreshAndDetectConflicts(template, jiraService)` immediately.
  - This guarantees that by the time the user reaches submit, we have the best chance to have detected drift.

This matches the earlier **C strategy**: render from cache immediately, refresh in background, and update the form if conflicts are found.

#### Popup session guard

We introduce an in-memory guard (popup lifetime) so opening menus / typing does not re-trigger refresh:

```typescript
// apps/extension/src/entrypoints/popup/App.tsx (concept)

let didRefreshThisPopupSession = false

export function App() {
  useEffect(() => {
    if (didRefreshThisPopupSession) return
    didRefreshThisPopupSession = true

    // Fire-and-forget: refresh caches/conflicts for the active site
    // Only for the most recently used templates
    getTemplateService().refreshForActiveSite({
      ttlMs: 24 * 60 * 60 * 1000,
      limit: 5
    })
  }, [])

  return <Routes />
}
```

#### TemplateService API adjustment

```typescript
class TemplateServiceImpl {
  // ... existing methods

  /**
   * Refresh field metadata + conflict status for templates belonging to the active Jira site.
   * Only refreshes the most recently used N templates to reduce network usage.
   * Uses TTL to avoid redundant network calls.
   */
  async refreshForActiveSite(options: {
    ttlMs: number
    limit: number // e.g. 5
  }): Promise<void>
}
```

#### Notes

- If refresh fails (offline / Jira error), the form still renders from cache and falls back to **Reactive Recovery** on submit.
- We keep `TemplateConflicts` in local storage to show ⚠️ badges in TemplateMenu and Options.
- We need a `lastUsedAt` (or usage counter) on `IssueTemplate` to define “recently used”.
- Future optimization: refresh only the specific `{projectKey, issueTypeId}` combinations used by the recently used templates.


---

## 5. UI Components

### 5.1 Popup - Template Trigger

```typescript
// apps/extension/src/entrypoints/popup/menus/MainMenu/MainMenu.tsx

export function MainMenu() {
  const searchQuery = useSearchQuery()

  const isExtraActionsMenuVisible = searchQuery.startsWith('/')
  const isTemplateMenuVisible =
    searchQuery.startsWith('C') || searchQuery.startsWith('+')

  if (isTemplateMenuVisible) {
    return <TemplateMenu />
  }

  if (isExtraActionsMenuVisible) {
    return <ExtraActionsMenu />
  }

  return <TicketListMenu />
}
```

### 5.2 Popup - TemplateMenu

```typescript
// apps/extension/src/entrypoints/popup/menus/MainMenu/TemplateMenu.tsx

export function TemplateMenu() {
  const searchQuery = useSearchQuery()
  const navigate = useCommandNavigate()

  const keyword = searchQuery.slice(1).toLowerCase()
  const { data: templates = [] } = useTemplates()
  const { data: conflicts = {} } = useAllTemplateConflicts()

  const matchingTemplates = useMemo(() => {
    if (!keyword) return templates
    return templates.filter(
      (t) =>
        t.trigger.toLowerCase().includes(keyword) ||
        t.name.toLowerCase().includes(keyword)
    )
  }, [templates, keyword])

  return (
    <CommandList>
      <CommandGroup heading="Issue Templates">
        {matchingTemplates.map((template) => (
          <CommandItem
            key={template.id}
            value={template.trigger}
            onSelect={() =>
              navigate.push('/create-issue', { templateId: template.id })
            }
          >
            <span>{template.icon}</span>
            <span>{template.name}</span>
            <span className="text-muted-foreground">+{template.trigger}</span>
            {conflicts[template.id]?.length > 0 && (
              <Badge variant="warning">⚠️</Badge>
            )}
          </CommandItem>
        ))}
      </CommandGroup>

      {matchingTemplates.length === 0 && (
        <CommandEmpty>
          No templates found. Create one in Settings → Templates.
        </CommandEmpty>
      )}
    </CommandList>
  )
}
```

### 5.3 Popup - CreateIssueForm

```typescript
// apps/extension/src/entrypoints/popup/menus/CreateIssueMenu.tsx

export function CreateIssueMenu({ templateId }: { templateId: string }) {
  const {
    visibleFields,
    conflicts,
    isRefreshing,
    isReady,
    template
  } = useCreateIssueForm({ templateId })

  const [formData, setFormData] = useState<Record<string, unknown>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [extraFields, setExtraFields] = useState<VisibleField[]>([])

  const { mutate: createIssue, isPending } = useMutationCreateIssue({
    onSuccess: (issue) => {
      toast.success(`Created ${issue.key}`)
      // Return to main menu instead of closing
      navigate.pop()
    },
    onError: (error) => {
      // Reactive Recovery: parse 400 errors
      if (error.status === 400 && error.errors) {
        handleValidationErrors(error.errors)
      }
    }
  })

  const handleValidationErrors = (errorMap: Record<string, string>) => {
    const newErrors: Record<string, string> = {}
    const newExtraFields: VisibleField[] = []

    for (const [fieldId, message] of Object.entries(errorMap)) {
      newErrors[fieldId] = message

      // If field not already visible, add it
      const isVisible = visibleFields.some((f) => f.fieldId === fieldId)
      if (!isVisible && !extraFields.some((f) => f.fieldId === fieldId)) {
        // We need metadata to render - trigger a refresh if missing
        newExtraFields.push({
          fieldId,
          isEditable: true,
          conflict: {
            fieldId,
            fieldName: fieldId,
            type: 'now_required',
            message
          }
        })
      }
    }

    setErrors(newErrors)
    setExtraFields((prev) => [...prev, ...newExtraFields])
    toast.warning('Some fields need attention')
  }

  const handleSubmit = () => {
    if (!template) return

    // Merge: template presets + user input
    const presets: Record<string, unknown> = {}
    for (const [fieldId, config] of Object.entries(template.fields)) {
      if (config.behavior === 'preset' && config.presetValue !== undefined) {
        presets[fieldId] = config.presetValue
      }
    }

    const payload = {
      project: { key: template.scope.projectKey },
      issuetype: { id: template.scope.issueTypeId },
      ...presets,
      ...formData
    }

    createIssue(payload)
  }

  if (!isReady) {
    return <FormSkeleton />
  }

  const allFields = [...visibleFields, ...extraFields]

  return (
    <CommandList>
      {/* Conflict warning */}
      {conflicts.length > 0 && (
        <Alert variant="warning" className="mb-4">
          <AlertTitle>Template needs attention</AlertTitle>
          <AlertDescription>
            Some preset values are outdated. Please review highlighted fields.
          </AlertDescription>
        </Alert>
      )}

      {/* Refresh indicator */}
      {isRefreshing && (
        <div className="text-xs text-muted-foreground mb-2">
          Checking for updates...
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {allFields.map((field) => (
          <FieldRenderer
            key={field.fieldId}
            field={field}
            value={formData[field.fieldId] ?? field.presetValue}
            onChange={(value) =>
              setFormData((prev) => ({ ...prev, [field.fieldId]: value }))
            }
            error={errors[field.fieldId]}
            hasConflict={!!field.conflict}
          />
        ))}

        <Button type="submit" disabled={isPending}>
          {isPending ? 'Creating...' : 'Create Issue'}
        </Button>
      </form>
    </CommandList>
  )
}
```

### 5.4 Options - TemplatesTab

```typescript
// apps/extension/src/entrypoints/options/components/tabs/TemplatesTab.tsx

export function TemplatesTab() {
  const { data: templates = [] } = useTemplates()
  const { data: conflicts = {} } = useAllTemplateConflicts()
  const [editingId, setEditingId] = useState<string | null>(null)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2>Issue Templates</h2>
        <Button onClick={() => setEditingId('new')}>Create Template</Button>
      </div>

      <TemplateList
        templates={templates}
        conflicts={conflicts}
        onEdit={setEditingId}
      />

      {editingId && (
        <TemplateEditorDialog
          templateId={editingId === 'new' ? undefined : editingId}
          onClose={() => setEditingId(null)}
        />
      )}
    </div>
  )
}
```

### 5.5 Field Renderer Component

```typescript
// apps/extension/src/components/fields/FieldRenderer.tsx

interface FieldRendererProps {
  field: VisibleField
  value: unknown
  onChange: (value: unknown) => void
  error?: string
  hasConflict?: boolean
}

export function FieldRenderer({
  field,
  value,
  onChange,
  error,
  hasConflict
}: FieldRendererProps) {
  const { metadata } = field
  const schema = metadata?.schema

  // Wrapper with conflict/error styling
  const wrapperClass = cn(
    'mb-4',
    hasConflict && 'ring-2 ring-yellow-400 rounded-md p-2',
    error && 'ring-2 ring-red-400 rounded-md p-2'
  )

  // Determine component based on schema type
  const renderField = () => {
    if (!schema) {
      // No metadata available - render as text input
      return <StringField field={field} value={value} onChange={onChange} />
    }

    if (schema.type === 'string' && !schema.custom) {
      return <StringField field={field} value={value} onChange={onChange} />
    }

    if (schema.type === 'number') {
      return <NumberField field={field} value={value} onChange={onChange} />
    }

    if (schema.type === 'option' || schema.type === 'priority') {
      return <SelectField field={field} value={value} onChange={onChange} />
    }

    if (schema.type === 'array') {
      if (schema.items === 'string') {
        return <TagsField field={field} value={value} onChange={onChange} />
      }
      return <MultiSelectField field={field} value={value} onChange={onChange} />
    }

    if (schema.type === 'user') {
      return <UserPickerField field={field} value={value} onChange={onChange} />
    }

    // Fallback
    return <StringField field={field} value={value} onChange={onChange} />
  }

  return (
    <div className={wrapperClass}>
      <Label>{metadata?.name ?? field.fieldId}</Label>
      {hasConflict && field.conflict && (
        <p className="text-xs text-yellow-600 mb-1">{field.conflict.message}</p>
      )}
      {renderField()}
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  )
}
```

---

## 6. Error Handling

### 6.1 Conflict Detection & Recovery (Lazy Refresh)

When the lazy refresh detects conflicts:

| Conflict Type     | Behavior                                                 |
| ----------------- | -------------------------------------------------------- |
| `preset_invalid`  | Show field in form with warning, let user select new value |
| `now_required`    | Add field to form with warning                           |
| `field_removed`   | Remove from form, log warning                            |
| `scope_invalid`   | Show error, disable form                                 |

### 6.2 Reactive Recovery (400 Errors)

When Jira returns a 400 error:

```json
{
  "errorMessages": [],
  "errors": {
    "customfield_10021": "Epic Link is required.",
    "fixVersions": "Fix Version/s is required."
  }
}
```

**Strategy:**
1. Parse `errors` object
2. Add missing fields to form with error styling
3. Toast: "Some fields need attention"
4. Keep popup open, let user fill missing fields

### 6.3 Storage Quota Handling

```typescript
const MAX_TEMPLATES = 50
const TEMPLATE_SIZE_WARNING = 3000 // bytes

async function createTemplate(template: IssueTemplate) {
  const templates = await getTemplates()

  if (templates.length >= MAX_TEMPLATES) {
    throw new Error(
      'Maximum template limit reached (50). Please delete unused templates.'
    )
  }

  const serialized = JSON.stringify(template)
  if (serialized.length > TEMPLATE_SIZE_WARNING) {
    console.warn('Template is large:', serialized.length, 'bytes')
  }

  // Proceed with creation
}
```

---

## 7. Testing Strategy

### 7.1 Unit Tests

```typescript
// apps/extension/src/services/template-service/gap-analysis.test.ts

describe('computeVisibleFields', () => {
  it('should always include summary field', () => {
    const template = createMockTemplate({ fields: {} })
    const cache = createMockCache([mockSummaryField])

    const visible = computeVisibleFields(template, cache, [])

    expect(visible).toContainEqual(
      expect.objectContaining({ fieldId: 'summary' })
    )
  })

  it('should show fields with behavior=visible', () => {
    const template = createMockTemplate({
      fields: {
        priority: { behavior: 'visible' }
      }
    })
    const cache = createMockCache([mockSummaryField, mockPriorityField])

    const visible = computeVisibleFields(template, cache, [])

    expect(visible).toContainEqual(
      expect.objectContaining({ fieldId: 'priority', isEditable: true })
    )
  })

  it('should hide fields with behavior=preset (no conflict)', () => {
    const template = createMockTemplate({
      fields: {
        components: { behavior: 'preset', presetValue: [{ id: '123' }] }
      }
    })
    const cache = createMockCache([mockSummaryField, mockComponentsField])

    const visible = computeVisibleFields(template, cache, [])

    expect(visible).not.toContainEqual(
      expect.objectContaining({ fieldId: 'components' })
    )
  })

  it('should show preset fields when conflict detected', () => {
    const template = createMockTemplate({
      fields: {
        components: { behavior: 'preset', presetValue: [{ id: '123' }] }
      }
    })
    const conflicts: FieldConflict[] = [
      {
        fieldId: 'components',
        fieldName: 'Components',
        type: 'preset_invalid',
        message: 'Value no longer available'
      }
    ]

    const visible = computeVisibleFields(template, null, conflicts)

    expect(visible).toContainEqual(
      expect.objectContaining({
        fieldId: 'components',
        isEditable: true,
        conflict: expect.objectContaining({ type: 'preset_invalid' })
      })
    )
  })

  it('should add now_required fields even if not in template', () => {
    const template = createMockTemplate({ fields: {} })
    const conflicts: FieldConflict[] = [
      {
        fieldId: 'customfield_123',
        fieldName: 'Epic Link',
        type: 'now_required',
        message: 'Field is now required',
        fieldMetadata: mockEpicLinkField
      }
    ]

    const visible = computeVisibleFields(template, null, conflicts)

    expect(visible).toContainEqual(
      expect.objectContaining({
        fieldId: 'customfield_123',
        conflict: expect.objectContaining({ type: 'now_required' })
      })
    )
  })
})
```

### 7.2 Conflict Detection Tests

```typescript
// apps/extension/src/services/template-service/conflict-detection.test.ts

describe('refreshAndDetectConflicts', () => {
  it('should detect preset_invalid when value not in allowedValues', async () => {
    const template = createMockTemplate({
      fields: {
        priority: { behavior: 'preset', presetValue: { id: 'deleted-priority' } }
      }
    })

    const mockJiraService = {
      getCreateIssueMetaIssueTypeId: vi.fn().mockResolvedValue({
        fields: [
          {
            fieldId: 'priority',
            name: 'Priority',
            schema: { type: 'priority' },
            allowedValues: [{ id: '1' }, { id: '2' }] // deleted-priority not here
          }
        ]
      })
    }

    const result = await refreshAndDetectConflicts(template, mockJiraService)

    expect(result.conflicts).toContainEqual(
      expect.objectContaining({
        fieldId: 'priority',
        type: 'preset_invalid'
      })
    )
  })

  it('should detect now_required for new required fields', async () => {
    const template = createMockTemplate({ fields: {} }) // No fields configured

    const mockJiraService = {
      getCreateIssueMetaIssueTypeId: vi.fn().mockResolvedValue({
        fields: [
          { fieldId: 'summary', required: true },
          { fieldId: 'customfield_epic', name: 'Epic', required: true } // New required
        ]
      })
    }

    const result = await refreshAndDetectConflicts(template, mockJiraService)

    expect(result.conflicts).toContainEqual(
      expect.objectContaining({
        fieldId: 'customfield_epic',
        type: 'now_required'
      })
    )
  })
})
```

### 7.3 Integration Tests

```typescript
// apps/extension/src/services/template-service/index.test.ts

describe('TemplateService', () => {
  describe('CRUD operations', () => {
    it('should create template with generated ID and timestamps')
    it('should update template and refresh updatedAt')
    it('should delete template by ID')
    it('should find templates by trigger keyword')
  })

  describe('cache management', () => {
    it('should store field metadata in local storage')
    it('should retrieve cached metadata by cacheKey')
    it('should update cache after refresh')
  })
})
```

### 7.4 E2E Tests

```typescript
// apps/extension/e2e/templates.spec.ts

test.describe('Issue Templates', () => {
  test('should create issue using template with preset values', async ({
    page,
    extensionId
  }) => {
    // Setup: Create template
    // ...

    // Use template
    await page.keyboard.press('Alt+J')
    await page.fill('[aria-label="Search"]', '+febug')
    await page.click('text=Frontend Bug')

    // Only summary should be visible (other fields preset)
    await expect(page.locator('[name="summary"]')).toBeVisible()
    await expect(page.locator('[name="components"]')).not.toBeVisible()

    await page.fill('[name="summary"]', 'Test bug')
    await page.click('text=Create Issue')

    await expect(page.locator('text=Created PROJ-')).toBeVisible()
  })

  test('should show conflict field when preset becomes invalid', async ({
    page
  }) => {
    // Mock API to return different allowedValues
    // ...

    // Field should appear with warning
    await expect(page.locator('[name="priority"]')).toBeVisible()
    await expect(page.locator('text=Preset value is no longer available')).toBeVisible()
  })
})
```

---

## 8. Phase 1 Scope (MVP)

### 8.1 In Scope

| Feature               | Details                                                |
| --------------------- | ------------------------------------------------------ |
| Template CRUD         | Create, read, update, delete templates in Options page |
| Scope Selection       | Site → Project → Issue Type picker                     |
| Field Configuration   | preset / visible / ignore per field                    |
| Preset Fields         | String, Number, Single Select, Priority                |
| Array Fields          | Labels, Components (multi-select)                      |
| User Fields           | Assignee picker with autocomplete                      |
| Popup Trigger         | `C` or `+` prefix shows template menu                  |
| Gap Calculation       | Template-based, no runtime API for visible fields      |
| Lazy Refresh          | Background refresh with conflict detection             |
| Reactive Recovery     | Handle 400 errors by adding fields                     |
| Storage Split         | sync for templates, local for cache                    |

### 8.2 Out of Scope (Phase 2+)

| Feature                       | Reason                               |
| ----------------------------- | ------------------------------------ |
| Date/DateTime fields          | Requires date picker component       |
| Cascading Select              | Complex dual-combobox implementation |
| Extract from Issue            | P2 per PRD                           |
| Keyboard-only form navigation | Polish feature                       |
| Template import/export        | Nice-to-have                         |

---

## 9. File Structure

```
apps/extension/src/
├── components/
│   └── fields/
│       ├── FieldRenderer.tsx
│       ├── StringField.tsx
│       ├── NumberField.tsx
│       ├── SelectField.tsx
│       ├── MultiSelectField.tsx
│       ├── TagsField.tsx
│       ├── UserPickerField.tsx
│       └── index.ts
├── entrypoints/
│   ├── background/
│   │   ├── index.ts
│   │   └── services/
│   │       └── template-validator.ts
│   ├── options/
│   │   └── components/
│   │       └── tabs/
│   │           ├── TemplatesTab.tsx
│   │           ├── TemplateList.tsx
│   │           ├── TemplateEditor.tsx
│   │           └── index.ts
│   └── popup/
│       └── menus/
│           └── MainMenu/
│               ├── MainMenu.tsx
│               ├── TemplateMenu.tsx
│               └── CreateIssueMenu.tsx
├── hooks/
│   ├── useTemplates.ts
│   ├── useFieldMetadataCache.ts
│   ├── useCreateIssueForm.ts
│   └── useMutationCreateIssue.ts
├── lib/
│   ├── jira/
│   │   └── issues.ts
│   └── storage/
│       └── schema.ts
├── services/
│   └── template-service/
│       ├── index.ts
│       ├── gap-analysis.ts
│       ├── gap-analysis.test.ts
│       ├── conflict-detection.ts
│       ├── conflict-detection.test.ts
│       └── validation.ts
└── types/
    └── template.ts
```

---

## 10. Migration & Rollout

### 10.1 Feature Flag

No feature flag needed - templates are opt-in.

### 10.2 Backwards Compatibility

- No breaking changes to existing storage
- New storage keys have fallback defaults
- Existing functionality unaffected

### 10.3 Rollout Plan

1. **Alpha**: Internal testing
2. **Beta**: Opt-in users
3. **GA**: Full release

---

## 11. Open Questions

1. **Template Sharing**: Export/import as JSON? _(Deferred to Phase 2)_

2. **Template Ordering**: Alphabetical by trigger for MVP

3. **Cache TTL**: How long before cache is considered stale?
   - Proposal: 24 hours, but always lazy refresh on form open

---

## 12. References

- [PRD: Fast Track Issue Templates](./Fast%20Track%20Issue%20Template%20PRD.md)
- [Jira REST API: Create Issue Meta](https://developer.atlassian.com/cloud/jira/platform/rest/v3/api-group-issues/#api-rest-api-3-issue-createmeta-get)
- [jira.js Documentation](https://mrrefactoring.github.io/jira.js/)
- [WXT Storage API](https://wxt.dev/guide/storage.html)
