# Template Field Configuration - Quick Reference

> Quick lookup guide for working with field configurations. See [template-field-configuration.md](./template-field-configuration.md) for full design rationale.

## Type Definitions

```typescript
// Core discriminated union
type FieldConfig =
  | { behavior: 'visible' } // Show with all options
  | { behavior: 'preset'; presetValue: unknown } // Auto-fill value
  | { behavior: 'restricted'; allowedOptions: AllowedValue[] } // Limit choices
  | { behavior: 'ignore' } // Omit field

// Unified option shape (Jira-provided OR user-defined)
type AllowedValue = {
  id: string // Jira's ID or nanoid
  name?: string // Display label
  value?: string // Simple value
  // ... other Jira fields
}
```

## Mode Mapping

| User-Facing Label | Internal Behavior | Data Shape                                          |
| ----------------- | ----------------- | --------------------------------------------------- |
| **Show**          | `visible`         | `{ behavior: 'visible' }`                           |
| **Fill**          | `preset`          | `{ behavior: 'preset', presetValue: T }`            |
| **Limit**         | `restricted`      | `{ behavior: 'restricted', allowedOptions: [...] }` |
| _(removed)_       | `ignore`          | _(field not in template)_                           |

## Field Type Decision Tree

```
Has field.allowedValues?
├─ YES (Select, Multi-select, Priority, etc.)
│  ├─ Fill mode:  Dropdown from Jira options
│  └─ Limit mode: Checkbox grid from Jira options
│
└─ NO (Number, Text, User, etc.)
   ├─ Fill mode:  Native input (number/text/user-search)
   └─ Limit mode: Chip input (user creates options)
                  └─ User fields: NOT YET IMPLEMENTED
```

## Validation Rules

```typescript
// Rule 1: Preset must have value
if (config.behavior === 'preset') {
  assert(
    config.presetValue !== undefined &&
      config.presetValue !== null &&
      config.presetValue !== ''
  )
}

// Rule 2: Restricted must have options
if (config.behavior === 'restricted') {
  assert(config.allowedOptions.length >= 1)
}
```

## Common Patterns

### Adding a field (default to visible)

```typescript
actions.setFieldConfig(fieldId, { behavior: 'visible' })
```

### Setting a preset value

```typescript
actions.setFieldConfig(fieldId, {
  behavior: 'preset',
  presetValue: 'High' // for select fields
  // or
  presetValue: 5 // for number fields
  // or
  presetValue: { accountId: '...' } // for user fields
})
```

### Restricting to Jira options (select fields)

```typescript
// Start with all options
actions.setFieldConfig(fieldId, {
  behavior: 'restricted',
  allowedOptions: field.allowedValues
})

// User toggles options in UI
const toggleOption = (option: AllowedValue) => {
  const selected = new Set(config.allowedOptions.map((o) => o.id))
  const next = selected.has(option.id)
    ? config.allowedOptions.filter((o) => o.id !== option.id)
    : [...config.allowedOptions, option]

  actions.setFieldConfig(fieldId, {
    behavior: 'restricted',
    allowedOptions: next
  })
}
```

### Restricting to user-defined options (number fields)

```typescript
// Start empty
actions.setFieldConfig(fieldId, {
  behavior: 'restricted',
  allowedOptions: []
})

// User adds options via chip input
const addOption = (value: string) => {
  const num = Number(value)
  if (!Number.isFinite(num)) return // validate

  const newOption: AllowedValue = {
    id: nanoid(8),
    name: value,
    value: value
  }

  actions.setFieldConfig(fieldId, {
    behavior: 'restricted',
    allowedOptions: [...config.allowedOptions, newOption]
  })
}
```

## Component Architecture

```
FieldRow.tsx
  ├─ ModeToggle (3-way segmented control)
  └─ Conditional panels:
      ├─ FieldInput.tsx (when mode = preset)
      └─ RestrictedOptionsInput.tsx (when mode = restricted)
          ├─ JiraProvidedOptions (checkbox grid)
          └─ UserDefinedOptions (chip input)
```

## Save Flow

```typescript
// In context.tsx save()
1. Validate all fieldsConfig entries
   ├─ Preset: must have value
   └─ Restricted: must have ≥1 option

2. If errors:
   ├─ setSaveError(formatted errors)
   └─ return (block save)

3. If valid:
   └─ Call getTemplateService().createTemplate() or updateTemplate()
```

## Troubleshooting

### "Preset value required" error on save

**Cause:** Field in Fill mode but `presetValue` is `undefined`, `null`, or empty string

**Fix:** Either set a value or switch back to Show mode

### "At least one option required" error on save

**Cause:** Field in Limit mode but `allowedOptions` is empty array

**Fix:** Either add options (Jira checkbox or chip input) or switch to Show/Fill mode

### User field Limit mode shows "coming soon" message

**Status:** Not yet implemented — needs user search API integration

**Workaround:** Use Fill mode to preset a user, or Show mode for full user search

### Number field won't accept decimal

**Expected:** Only integers supported in chip input (common for story points)

**If needed:** Use Fill mode with direct number input (supports decimals)

## Examples by Field Type

### Priority (Select with Jira options)

```typescript
// Show: all priorities available
{ behavior: 'visible' }

// Fill: auto-set to "High"
{ behavior: 'preset', presetValue: { id: '2', name: 'High' } }

// Limit: only High and Critical
{
  behavior: 'restricted',
  allowedOptions: [
    { id: '1', name: 'Critical', iconUrl: '...' },
    { id: '2', name: 'High', iconUrl: '...' }
  ]
}
```

### Story Points (Number without Jira options)

```typescript
// Show: free number input
{ behavior: 'visible' }

// Fill: auto-set to 5
{ behavior: 'preset', presetValue: 5 }

// Limit: only 1, 2, 3, 5, 8
{
  behavior: 'restricted',
  allowedOptions: [
    { id: 'sp-k3j5h2', name: '1', value: '1' },
    { id: 'sp-m9n4p1', name: '2', value: '2' },
    { id: 'sp-q7r8s3', name: '3', value: '3' },
    { id: 'sp-t2v6w9', name: '5', value: '5' },
    { id: 'sp-x4y1z8', name: '8', value: '8' }
  ]
}
```

### Assignee (User field)

```typescript
// Show: full user search
{ behavior: 'visible' }

// Fill: auto-assign to Alice
{
  behavior: 'preset',
  presetValue: { accountId: '5f4e3d...' }
}

// Limit: 🚧 NOT YET IMPLEMENTED
// When implemented:
{
  behavior: 'restricted',
  allowedOptions: [
    { id: 'u-abc', name: 'Alice Chen', value: { accountId: '5f4e...' } },
    { id: 'u-def', name: 'Bob Park', value: { accountId: '6a7b...' } }
  ]
}
```

## Related Files

| Purpose            | Path                                                                                  |
| ------------------ | ------------------------------------------------------------------------------------- |
| Type definitions   | `src/types/template.ts`                                                               |
| Field row (toggle) | `src/entrypoints/options/routes/templates/template-wizard/FieldRow.tsx`               |
| Value input        | `src/entrypoints/options/routes/templates/template-wizard/FieldInput.tsx`             |
| Options input      | `src/entrypoints/options/routes/templates/template-wizard/RestrictedOptionsInput.tsx` |
| Validation & save  | `src/entrypoints/options/routes/templates/template-wizard/context.tsx`                |
| Fields list        | `src/entrypoints/options/routes/templates/template-wizard/FieldsSection.tsx`          |

---

**Last updated:** 2025-01-31
