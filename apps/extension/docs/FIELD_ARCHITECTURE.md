# Jira Field Architecture Guide

**Understanding how Jira fields are supported across the application**

---

## Core Concept

The application has **two parallel systems** for handling Jira fields:

1. **Template Editor** - Configure how fields behave in templates
2. **Create Issue Wizard** - Fill field values when creating issues

Both systems use the **same architectural pattern** but with different UI implementations.

---

## The Registry Pattern

### Why a Registry?

Instead of hard-coding field handling logic with if/else chains, we use a **registry** that maps field types to components. This makes the system:

- **Extensible**: Add new field types by registering components
- **Maintainable**: Field logic is isolated in dedicated components
- **Consistent**: Both systems use the same lookup strategy

### 5-Level Fallback Strategy

When a field needs to be rendered, the registry checks in order:

```
1. Field Key        → Is this a known field? (labels, parent, summary)
2. Custom Type      → Is this a custom field? (Sprint, Epic Link)
3. Array Items      → What type of array? (string[] vs object[])
4. Schema Type      → What's the basic type? (string, number, user)
5. Fallback         → Show "unsupported" message
```

**Example**: Sprint field
```
1. Field Key?       ✗ (not "labels" or "parent")
2. Custom Type?     ✓ "com.pyxis.greenhopper.jira:gh-sprint" → SprintInput
   └─ MATCH! Use SprintInput component
```

**Example**: Story Points field
```
1. Field Key?       ✗
2. Custom Type?     ✗
3. Array Items?     ✗ (not an array)
4. Schema Type?     ✓ "number" → NumberInput
   └─ MATCH! Use NumberInput component
```

---

## Parallel Structure

Both systems mirror each other's organization:

```
Template Editor                    Create Issue Wizard
─────────────────                  ───────────────────
template-wizard/                   CreateIssue/
  components/fields/                 fields/
    ├── primitive/                     ├── primitive/
    │   ├── StringInput                │   ├── CommandStringInput
    │   ├── NumberInput                │   ├── CommandNumberInput
    │   └── ...                        │   └── ...
    ├── specialized/                   ├── specialized/
    │   ├── LabelsInput                │   ├── LabelsInput
    │   ├── SprintInput                │   ├── SprintInput
    │   └── ...                        │   └── ...
    └── fieldRegistry.tsx              └── fieldRegistry.tsx
```

### Component Categories

**Primitive Components**
- Generic, reusable across any field type
- Driven by Jira schema type (string, number, user, etc.)
- Example: NumberInput works for any numeric field

**Specialized Components**
- Domain-specific, tailored to particular fields
- Require custom logic or API calls
- Example: SprintInput fetches sprint data from Agile API

---

## Field Information Flow

```
┌─────────────────────────────────────────────────────────────┐
│ Jira API (createMeta endpoint)                              │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ FieldMetadata                                               │
│ {                                                           │
│   fieldId: "customfield_10001"                             │
│   name: "Sprint"                                           │
│   schema: {                                                │
│     type: "array"                                          │
│     custom: "com.pyxis.greenhopper.jira:gh-sprint"        │
│   }                                                        │
│ }                                                          │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ Registry Lookup (5-level fallback)                         │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ Component Selected                                          │
│ → SprintInput                                              │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ UI Rendered                                                 │
│ Template Editor: Dropdown with date ranges                 │
│ Create Issue: Command palette with keyboard shortcuts      │
└─────────────────────────────────────────────────────────────┘
```

---

## Adding Support for a New Field Type

### High-Level Workflow

1. **Identify the field's schema type**
   - Check Jira API response for `schema.type` and `schema.custom`
   - Determine if it's primitive (string, number) or specialized (custom)

2. **Create components for both systems**
   - Template Editor: Form-based component
   - Create Issue: Command UI component

3. **Register in both registries**
   - Add mapping in `fieldRegistry.tsx` for each system
   - Use appropriate registry level (field key, custom type, or schema type)

4. **Test in both contexts**
   - Verify field works in template configuration
   - Verify field works in issue creation flow

### Example: Supporting a New Custom Field

Let's say Jira returns:
```json
{
  "fieldId": "customfield_10050",
  "schema": {
    "type": "any",
    "custom": "com.atlassian.jira.plugin:watchers"
  }
}
```

**Decision**: This needs a specialized component (fetches users who can watch)

**Template Editor**: Create `WatchersInput.tsx`
- Use AutoComplete component
- Fetch available users
- Register in `componentByCustomType`

**Create Issue**: Create `WatchersInput.tsx`
- Use CommandItem list
- Fetch users with async search
- Register in `componentByCustomType`

---

## Key Architectural Principles

### 1. Separation of Concerns

```
Registry        → Routing logic (which component?)
Components      → UI rendering (how to display?)
Utilities       → Shared helpers (formatting, validation)
```

### 2. Single Responsibility

Each component handles **one field type** and nothing else:
- LabelsInput only handles labels
- SprintInput only handles sprints
- NumberInput only handles numeric fields

### 3. Interface Consistency

All components in a system share the same interface:

**Template Editor**:
```typescript
interface FieldInputBaseProps<T> {
  value: T | undefined
  onChange: (value: T | undefined) => void
  // ... context props
}
```

**Create Issue**:
```typescript
interface FieldInputProps {
  field: VisibleField
  currentValue: unknown
  onConfirm: (value: unknown) => void
}
```

### 4. Registry Extensibility

Adding a new field type **never requires changing existing code**, only:
- Add new component files
- Add new registry entry

---

## System Differences

| Aspect | Template Editor | Create Issue |
|--------|----------------|--------------|
| **UI Pattern** | Standard form controls | Command palette |
| **User Intent** | Configure template | Fill issue values |
| **Component Style** | Dropdown, inputs, autocomplete | Keyboard-first selection |
| **Value Flow** | onChange → immediate update | onConfirm → advance to next |

Despite different UI patterns, the **architectural structure is identical**.

---

## Registry File Structure

Both registries follow the same pattern:

```typescript
// Define component mappings
const componentByFieldKey = { /* ... */ }
const componentByCustomType = { /* ... */ }
const componentBySchemaType = { /* ... */ }

// Lookup function with 5-level fallback
export function getFieldInputComponent(field: VisibleField) {
  // Level 1: Check field key
  // Level 2: Check custom type
  // Level 3: Check array items
  // Level 4: Check schema type
  // Level 5: Return fallback
}
```

This function is the **only routing logic** in the entire field rendering system.

---

## Common Pitfalls

❌ **Adding field-specific logic outside components**
- Don't add if/else in calling code
- Keep all field logic inside the component

❌ **Inconsistent registry levels**
- Don't mix field key and schema type for the same field
- Use the most specific level possible

❌ **Forgetting both systems**
- Always implement in both Template Editor and Create Issue
- Fields should work consistently across both

✅ **Follow the pattern**
- Create component → Register → Test
- Reuse existing utilities and hooks
- Keep implementation details inside components

---

## Where to Find Things

```
Field Registries:
  • Template Editor: template-wizard/components/fields/fieldRegistry.tsx
  • Create Issue:    CreateIssue/fields/fieldRegistry.tsx

Field Components:
  • Template Editor: template-wizard/components/fields/{primitive,specialized}/
  • Create Issue:    CreateIssue/fields/{primitive,specialized}/

Shared Utilities:
  • Jira Services:   services/jira-service.ts
  • Type Definitions: types/template.ts
  • Hooks:           hooks/ (useLabels, useSprints, etc.)
```

---

## Summary

1. **Two parallel systems** with identical architecture
2. **Registry pattern** eliminates routing complexity
3. **5-level fallback** handles all field types systematically
4. **Component isolation** keeps field logic contained
5. **Adding fields** is straightforward: component + registry entry

The architecture is designed for **extensibility** and **maintainability**, not for cleverness. When in doubt, follow the existing patterns.

---

**Related Documentation**:
- Field component interfaces: `primitive/types.ts`
- Template system: `REFACTORING.md`
- Type definitions: `~/types/template.ts`
