# Field Confirmation Refactoring

## Problem

The previous implementation had a monolithic approach to handling enter/confirm actions:

1. **`useScalarFieldEnter` hook** - Hardcoded logic for all scalar field types (string, number, array)
2. **`FieldInputMenu` parent** - Duplicated type-checking logic and complex hotkey handling
3. **Scattered hotkeys** - Some components handled their own hotkeys, others relied on parent
4. **Not extensible** - Adding new field types required modifying multiple files

## Solution

### Composable Hook Pattern

Created **`useFieldConfirm`** - a reusable, field-type-agnostic hook that:
- Centralizes hotkey handling
- Delegates value formatting to field components
- Uses inversion of control (components tell hook what to submit)
- Optimized with `useMemoizedFn` from ahooks

### Key Features

```tsx
// Generic hook with type safety
useFieldConfirm<T>({
  getValue: () => /* field provides its own value logic: T | { skip: true } */,
  onConfirm: (value: T) => /* called when user confirms with typed value */,
  keys: 'enter' | 'meta+enter' | 'both' | 'none',
  enabled: true
})
```

**Skip Pattern**: Fields can prevent confirmation for invalid input:
```tsx
getValue: () => {
  const num = Number(search)
  return Number.isFinite(num) ? num : { skip: true }
}
```

## Changes

### New Files Created

1. **`useFieldConfirm.ts`** - Composable confirmation hook
2. **`useFieldConfirm.test.ts`** - 16 comprehensive tests
3. **`fields/StringFieldInput.tsx`** - Dedicated string field component
4. **`fields/NumberFieldInput.tsx`** - Number field with validation
5. **`fields/ArrayFieldInput.tsx`** - Comma-separated array field

### Files Updated

1. **`fields/SummaryDescriptionFieldInput.tsx`** - Now uses `useFieldConfirm` with `meta+enter`
2. **`fields/MultiSelectFieldInput.tsx`** - Added `meta+enter` confirmation support
3. **`fields/SingleSelectFieldInput.tsx`** - Renamed `onSelect` → `onConfirm` for consistency
4. **`fields/UserFieldInputMenu.tsx`** - Renamed `onDone` → `onConfirm` for consistency
5. **`FieldInputMenu.tsx`** - Simplified to clean routing logic (removed complex hotkey handling)
6. **`fields/index.ts`** - Exports new field components

### Files Deleted

1. **`useScalarFieldEnter.ts`** - ❌ No longer needed (replaced by `useFieldConfirm`)

## Architecture

### Before

```
FieldInputMenu (Parent)
├─ useScalarFieldEnter hook (knows about all scalar types)
├─ Duplicate meta+enter logic
└─ Field components (inconsistent patterns)
   ├─ Some coupled to store (useCreateIssueDraftStore)
   ├─ Some require fieldId prop
   └─ Inconsistent confirm patterns
```

### After

```
FieldInputMenu (Parent - Smart Component)
├─ Reads from store: useCreateIssueDraftStore()
├─ Writes to store: setValue(fieldId, value)
├─ Simple routing based on field type
└─ Field components (Pure/Dumb Components)
   ├─ Receive data via props (currentValue, title, etc.)
   ├─ Call callbacks (onChange, onConfirm)
   ├─ No store coupling
   ├─ No fieldId needed
   └─ Each uses useFieldConfirm hook for hotkeys
```

### Data Flow

```
Store (useCreateIssueDraftStore)
  ↓ (read currentValue)
FieldInputMenu (Smart)
  ↓ (pass as props)
StringFieldInput (Dumb)
  ↓ (user edits)
useFieldConfirm hook
  ↓ (enter pressed)
onConfirm callback
  ↓ (bubble up)
FieldInputMenu
  ↓ (write value)
Store (setValue)
```

## Component Architecture: Pure & Dumb

All field components are **decoupled from stores** and follow **pure component** patterns:

### Before (Coupled)
```tsx
// ❌ Component knows about store and fieldId
function MultiSelectFieldInput({ fieldId, ... }) {
  const { values, setValue } = useCreateIssueDraftStore()
  const currentValue = values[fieldId]
  
  const toggle = (opt) => {
    setValue(fieldId, [...selected, opt])  // Direct store mutation
  }
}
```

### After (Pure)
```tsx
// ✅ Component is pure, receives props, calls callbacks
function MultiSelectFieldInput({ 
  currentValue,    // Data in
  onChange,        // Callback out
  onConfirm,       // Callback out
  ...
}) {
  const toggle = (opt) => {
    onChange([...selected, opt])  // Just notify parent
  }
}
```

### Benefits of Pure Components

| Aspect | Coupled (Before) | Pure (After) |
|--------|------------------|--------------|
| **Store dependency** | ❌ Direct `useCreateIssueDraftStore` | ✅ None - props only |
| **fieldId coupling** | ❌ Must pass `fieldId` prop | ✅ No fieldId needed |
| **Testability** | ❌ Must mock store | ✅ Just pass props |
| **Reusability** | ❌ Tied to CreateIssue flow | ✅ Can use anywhere |
| **Composition** | ❌ Hard to nest/combine | ✅ Easy to compose |
| **Debugging** | ❌ Store mutations unclear | ✅ Clear data flow |

## Benefits

| Aspect | Before | After |
|--------|--------|-------|
| **Hotkey logic** | Scattered & duplicated | Centralized in one hook |
| **Value formatting** | Hook knows all types | Each component owns logic |
| **Adding new types** | Modify hook + parent | Just add new component |
| **Testability** | Hard to isolate | Easy to test components |
| **Type safety** | Runtime checks | Compile-time safety |
| **Performance** | Recreates on re-renders | `useMemoizedFn` optimized |
| **Component coupling** | Direct store access | Pure props/callbacks |

## Field Components Interface

All field components are now **pure, dumb components** with consistent interfaces and **concrete typing**:

```tsx
// StringFieldInput
interface Props {
  title: string
  currentValue: unknown
  onConfirm: (value: string) => void  // ✅ Concrete type
}

// NumberFieldInput
interface Props {
  title: string
  currentValue: unknown
  onConfirm: (value: number | undefined) => void  // ✅ Concrete type
}

// ArrayFieldInput
interface Props {
  title: string
  currentValue: unknown
  onConfirm: (value: string[]) => void  // ✅ Concrete type
}
```

### Type Safety

The hook is **generic** to support type-safe field components:

```tsx
// In StringFieldInput
useFieldConfirm<string>({
  getValue: () => search,           // Returns: string
  onConfirm,                         // Expects: (value: string) => void
  keys: 'enter'
})

// In NumberFieldInput  
useFieldConfirm<number | undefined>({
  getValue: () => parseNumber(search), // Returns: number | undefined | { skip: true }
  onConfirm,                            // Expects: (value: number | undefined) => void
  keys: 'enter'
})
```

**Parent component** can still use a generic handler thanks to TypeScript's contravariance:

```tsx
// FieldInputMenu.tsx
const handleConfirm = (value: unknown) => {
  setValue(fieldId, value)  // Safe: accepts any value
  goToNextField()
}

// TypeScript allows passing (unknown) => void to (string) => void
<StringFieldInput onConfirm={handleConfirm} />  // ✅ Type safe
```

## Hotkey Patterns

- **Enter**: Simple fields (string, number, array)
- **Meta+Enter**: Complex fields (multi-select, summary+description)
- **Click**: Auto-submit fields (single-select, user picker)

## Test Coverage

- ✅ 16 tests for `useFieldConfirm` hook
- ✅ All existing tests pass (94/94)
- ✅ Type checking passes
- ✅ Lint warnings only from pre-existing code

## Migration Notes

No breaking changes - all field types work the same from user perspective. Internal implementation is cleaner and more maintainable.
