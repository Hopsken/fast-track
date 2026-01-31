# Template Field Configuration Design

## Overview

The template wizard field configuration system allows users to control how fields behave during issue creation. This document explains the design decisions behind the 3-way mode toggle and unified field option model.

## Design Philosophy

### Core Principle: Intent-Driven Configuration

Users configure fields by expressing **intent**, not by manipulating low-level states:

- **"I want this field to show up"** → Show mode (visible)
- **"I want to auto-fill a value"** → Fill mode (preset)
- **"I want to limit the choices"** → Limit mode (restricted)

### Progressive Disclosure

Fields start in the simplest state (Show) and users opt-in to more complex configurations. This avoids overwhelming new users while giving power users full control.

## Field Behaviors

### Three-Way Toggle

```
┌─────────────────────────────────┐
│ [ Show  |  Fill  |  Limit ]     │
└─────────────────────────────────┘
```

| Mode | Behavior | Data Model | Use Case |
|------|----------|------------|----------|
| **Show** | Field appears with all available options | `{ behavior: 'visible' }` | Add non-required fields (Description) to creation form |
| **Fill** | Auto-fill specific value at creation | `{ behavior: 'preset', presetValue: T }` | Set default Priority to "High" |
| **Limit** | Restrict to subset of options | `{ behavior: 'restricted', allowedOptions: AllowedValue[] }` | Only allow 3 Components out of 20 |

**Ignore** mode (field omitted) is handled by not adding the field to the template at all.

### Why Not a 4-Way Toggle?

We considered: `Ignore | Show | Fill | Limit`

**Problem:** "Ignore" is the absence of configuration, not a configuration choice. Including it creates confusion:
- Empty template = all fields ignored?
- Does toggling to Ignore delete the field?
- UI complexity: 4 states instead of 3

**Solution:** Keep Ignore implicit. Fields not in the template are ignored. Each field row has a remove button.

## Unified Field Option Model

### The Problem: Two Sources of Options

Fields can get their allowed options from two sources:

1. **Jira-provided** (select, multi-select, priority, etc.)
   - Source: `field.allowedValues` from Jira API
   - Example: Priority → `[{id: "1", name: "High"}, {id: "2", name: "Medium"}]`

2. **User-defined** (number, text, user)
   - Source: User creates them in the wizard
   - Example: Story points → User adds `[1, 2, 3, 5, 8, 13]`

### The Solution: Unified `AllowedValue` Shape

```typescript
type AllowedValue = {
  id: string;            // allowedValue.id for Jira; nanoid for user-defined
  name?: string;         // display text
  value?: string;        // for simple values
  // ... other Jira fields like iconUrl
}
```

**Key insight:** The **source** of options is a UI concern, not a model concern.

The persisted config doesn't distinguish:
```typescript
// Both stored the same way:
{ behavior: 'restricted', allowedOptions: AllowedValue[] }
```

The UI knows the source because it has `field.allowedValues`:
- If present → show checkbox grid
- If absent → show chip input for user-defined options

### Field Type Implementations

| Field Type | Jira allowedValues? | Limit Mode UI | Fill Mode UI |
|------------|---------------------|---------------|--------------|
| **Select** | ✅ Yes | Checkbox grid | Dropdown |
| **Multi-select** | ✅ Yes | Checkbox grid (multi) | Dropdown (multi) |
| **Priority** | ✅ Yes | Checkbox grid | Dropdown |
| **Number** | ❌ No | Chip input (validates numeric) | Number input |
| **Text** | ❌ No | Chip input (free-text) | Text input |
| **User** | ❌ No | 🚧 User search picker | User search |

### User-Defined Option Storage

**Number field example (Story Points):**
```typescript
// User adds: 1, 2, 3, 5, 8
{
  behavior: 'restricted',
  allowedOptions: [
    { id: 'sp-k3j5h2', name: '1', value: '1' },
    { id: 'sp-m9n4p1', name: '2', value: '2' },
    { id: 'sp-q7r8s3', name: '3', value: '3' },
    { id: 'sp-t2v6w9', name: '5', value: '5' },
    { id: 'sp-x4y1z8', name: '8', value: '8' },
  ]
}
```

**Text field example (Environment):**
```typescript
// User adds: Production, Staging, Dev
{
  behavior: 'restricted',
  allowedOptions: [
    { id: 'txt-a1b2c3', name: 'Production', value: 'Production' },
    { id: 'txt-d4e5f6', name: 'Staging', value: 'Staging' },
    { id: 'txt-g7h8i9', name: 'Dev', value: 'Dev' },
  ]
}
```

IDs generated via `nanoid(8)` for uniqueness.

## Validation Strategy

### Enforce, Don't Guess

**Rejected approach:** Empty preset → auto-convert to visible

**Problem:** Silent corrections hide user mistakes and create confusion.

**Adopted approach:** Validate at save time and block with clear errors

### Validation Rules

1. **Preset mode must have a value**
   ```typescript
   if (config.behavior === 'preset' && 
       (config.presetValue === undefined || 
        config.presetValue === null || 
        config.presetValue === '')) {
     error('Preset value required. Set a value or switch to Show mode.')
   }
   ```

2. **Restricted mode must have at least one option**
   ```typescript
   if (config.behavior === 'restricted' && 
       config.allowedOptions.length === 0) {
     error('At least one option required for restricted mode.')
   }
   ```

### Error Display

**Single error:**
```
Story Points: Preset value required. Set a value or switch to Show mode.
```

**Multiple errors:**
```
3 validation errors:
• Story Points: Preset value required. Set a value or switch to Show mode.
• Components: At least one option required for restricted mode.
• Description: Preset value required. Set a value or switch to Show mode.
```

## Empty State Handling

### When Adding a Field

**Default:** `{ behavior: 'visible' }`

**Rationale:**
- Safest assumption: user wants to see the field
- Matches most common use case: "add Description to template"
- User can toggle to Fill or Limit if needed

### When Switching Modes

**Show → Fill:**
```typescript
onModeChange('preset')
// → { behavior: 'preset', presetValue: undefined }
// Value input shown, placeholder: "Set a value"
// Validation blocks save until value set
```

**Show → Limit (Jira-provided options):**
```typescript
onModeChange('restricted')
// → { behavior: 'restricted', allowedOptions: field.allowedValues }
// Start with all options selected (safe default)
// User deselects unwanted options
```

**Show → Limit (user-defined options):**
```typescript
onModeChange('restricted')
// → { behavior: 'restricted', allowedOptions: [] }
// Chip input shown, empty state
// Validation blocks save until user adds options
```

## UI Implementation Details

### 3-Way Toggle Component

```typescript
const MODE_META: Record<FieldMode, { label: string; title: string }> = {
  visible:    { label: 'Show',  title: 'Field appears with all options' },
  preset:     { label: 'Fill',  title: 'Auto-fill value at creation' },
  restricted: { label: 'Limit', title: 'Restrict to subset of options' }
}
```

Implemented as a segmented control (radio group) for mutual exclusivity.

### Conditional Input Panels

```
┌─────────────────────────────────────────┐
│ Priority                    [x] Required │
│ [ Show | Fill | Limit ]                 │
│                                          │
│ ┌─ Fill mode ─────────────────────────┐ │
│ │ Value: [High ▾]                     │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ Priority                    [x] Required │
│ [ Show | Fill | Limit ]                 │
│                                          │
│ ┌─ Limit mode ────────────────────────┐ │
│ │ 2 of 3 options included             │ │
│ │ [ ✓ High ] [ ✓ Medium ] [ Low ]     │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ Story Points                             │
│ [ Show | Fill | Limit ]                 │
│                                          │
│ ┌─ Limit mode ────────────────────────┐ │
│ │ [_____________] [Add]                │ │
│ │ [ 1 x ] [ 2 x ] [ 3 x ] [ 5 x ]     │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

## Trade-offs & Rationale

### Decision: List vs Range for Number Fields

**Considered:** `{ min: 1, max: 100, step: 1 }`

**Rejected:** Story points are non-linear (1, 2, 3, 5, 8, 13). Ranges can't express this without custom step sequences, which is just a worse list.

**Adopted:** List of allowed numbers via chip input

**Future:** Could add range support if users request it for continuous intervals.

### Decision: Validation on Save vs On-the-Fly

**On-the-fly validation:**
- ✅ Immediate feedback
- ❌ Noisy (errors before user is done)
- ❌ Blocks user from saving progress

**Validation on save:**
- ✅ Less noisy
- ✅ User can leave fields incomplete and come back
- ❌ Delayed feedback

**Adopted:** Validation on save, with visual cues:
- Empty preset input gets subtle yellow outline
- Empty restricted options show "(add at least 1)" hint
- Save button always enabled (fail-fast at click)

### Decision: Draft vs Saved Types

**Problem:** TypeScript can't distinguish between "being edited" and "valid for persistence"

**Solution:** Two types:

```typescript
// Draft (lenient — used in React state)
type DraftFieldConfig = 
  | { behavior: 'preset'; value: unknown | undefined }
  | { behavior: 'restricted'; options: AllowedValue[] } // may be empty

// Saved (strict — persisted in storage)
type FieldConfig =
  | { behavior: 'preset'; presetValue: unknown }
  | { behavior: 'restricted'; allowedOptions: [AllowedValue, ...AllowedValue[]] }
```

**Future improvement:** Use Zod discriminated unions to enforce this at validation time.

## Future Considerations

### Phase 2: User Field Restricted Mode

**Challenge:** Need to implement user search API integration

**Proposed UI:**
```
┌─ Limit mode ────────────────────────────┐
│ [Search users...] [Search]              │
│                                          │
│ Added users:                             │
│ [ Alice Chen x ] [ Bob Park x ]          │
└─────────────────────────────────────────┘
```

**Storage:**
```typescript
{
  behavior: 'restricted',
  allowedOptions: [
    { id: 'u-abc123', name: 'Alice Chen', value: { accountId: '5f4e...' } },
    { id: 'u-def456', name: 'Bob Park',   value: { accountId: '6a7b...' } }
  ]
}
```

### Locked Preset Mode

**Use case:** "Auto-fill Priority = Critical AND prevent user from changing it"

**Proposed:**
```typescript
{ behavior: 'preset', presetValue: 'critical', locked: true }
```

**UI:** Add lock icon toggle in Fill mode

**Defer until requested** — adds complexity, unclear if needed.

### Conditional Field Dependencies

**Use case:** "Show field B only when field A = X"

**Example:** "Show 'Production Checklist' only when Environment = Production"

**This is fundamentally different** — requires dependency graph, execution order, reactivity.

**Recommendation:** Separate feature, not an extension of field config.

### Staleness Detection

**Problem:** Jira admin deletes a priority value that's in a template's restricted list

**Proposed solution:**
- At template load, compare `config.allowedOptions[].id` against `field.allowedValues[].id`
- Surface warnings in wizard: "⚠️ Option 'Ultra-High' no longer exists"
- Don't block — let user fix or ignore

**Status:** Low priority, defer until reported.

## Testing Strategy

### Unit Tests

**Field configuration logic:**
- ✅ Mode toggle transitions
- ✅ Default values when switching modes
- ✅ Validation rules (preset/restricted)

**Option management:**
- ✅ Add/remove user-defined options
- ✅ Toggle Jira-provided options
- ✅ Duplicate detection

### Integration Tests

**Template wizard flow:**
- ✅ Add field → defaults to visible
- ✅ Switch to Fill → shows input
- ✅ Switch to Limit → shows option picker
- ✅ Save with empty preset → blocks with error
- ✅ Save with empty restricted → blocks with error
- ✅ Save with valid configs → succeeds

### Manual Testing Checklist

- [ ] Number field: add story points 1, 2, 3, 5, 8
- [ ] Number field: try adding non-numeric → error
- [ ] Text field: add custom environment values
- [ ] Select field: toggle options on/off
- [ ] Multi-select: verify multiple selections work
- [ ] Save with empty preset → see error
- [ ] Fix error → save succeeds
- [ ] Edit template → configs preserved correctly

## References

- **Type schema:** `src/types/template.ts`
- **Field row component:** `src/entrypoints/options/routes/templates/template-wizard/FieldRow.tsx`
- **Restricted options input:** `src/entrypoints/options/routes/templates/template-wizard/RestrictedOptionsInput.tsx`
- **Wizard context (validation):** `src/entrypoints/options/routes/templates/template-wizard/context.tsx`
- **Oracle consultation:** [2025-01-31] Design discussion on field configuration model

---

**Last updated:** 2025-01-31  
**Status:** ✅ Implemented  
**Next review:** When adding user field support or locked preset mode
