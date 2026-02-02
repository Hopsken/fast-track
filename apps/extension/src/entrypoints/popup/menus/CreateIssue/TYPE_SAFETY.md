# Type Safety in useFieldConfirm

## The Question

> Why is `onConfirm` typed as `unknown` instead of concrete types like `string` for `StringFieldInput`?

## The Answer: It's NOT! ✅

We **do** use concrete types. Here's how:

---

## Generic Hook Design

The `useFieldConfirm` hook is **generic**:

```tsx
export function useFieldConfirm<T = unknown>({
  getValue: () => GetValueResult<T>,
  onConfirm: (value: T) => void,
  keys?: ConfirmKeys,
  enabled?: boolean
})
```

---

## Concrete Field Component Types

Each field component specifies its **concrete type**:

### StringFieldInput

```tsx
type Props = {
  title: string
  currentValue: unknown
  onConfirm: (value: string) => void  // ✅ String type
}

export function StringFieldInput({ onConfirm, ... }: Props) {
  useFieldConfirm<string>({          // ✅ Generic type parameter
    getValue: () => search,            // Returns string
    onConfirm,                         // Expects (value: string) => void
    keys: 'enter'
  })
}
```

### NumberFieldInput

```tsx
type Props = {
  onConfirm: (value: number | undefined) => void  // ✅ Number type
}

export function NumberFieldInput({ onConfirm, ... }: Props) {
  useFieldConfirm<number | undefined>({  // ✅ Generic type parameter
    getValue: () => {
      const num = Number(search)
      return Number.isFinite(num) ? num : { skip: true }
    },
    onConfirm,  // Expects (value: number | undefined) => void
    keys: 'enter'
  })
}
```

### ArrayFieldInput

```tsx
type Props = {
  onConfirm: (value: string[]) => void  // ✅ Array type
}

export function ArrayFieldInput({ onConfirm, ... }: Props) {
  useFieldConfirm<string[]>({        // ✅ Generic type parameter
    getValue: () => search.split(',').map(s => s.trim()),
    onConfirm,  // Expects (value: string[]) => void
    keys: 'enter'
  })
}
```

---

## How Parent Component Works

The parent `FieldInputMenu` uses a **generic handler**:

```tsx
const handleConfirm = (value: unknown) => {
  setValue(fieldId, value)  // setValue accepts unknown
  goToNextField()
}

// Pass to field components
<StringFieldInput onConfirm={handleConfirm} />
<NumberFieldInput onConfirm={handleConfirm} />
<ArrayFieldInput onConfirm={handleConfirm} />
```

### Why This Works (TypeScript Contravariance)

TypeScript allows a **more general** function type to be assigned where a **more specific** one is expected:

```tsx
// Component expects:
onConfirm: (value: string) => void

// We pass:
handleConfirm: (value: unknown) => void

// ✅ SAFE because:
// - Component calls onConfirm(someString)
// - handleConfirm accepts unknown, which includes string
// - No type error can occur
```

This is called **contravariance** for function parameters.

---

## Type Safety Guarantees

### ✅ Component Level
```tsx
// StringFieldInput
useFieldConfirm<string>({
  getValue: () => 123,  // ❌ Type error: number not assignable to string
  onConfirm,
  keys: 'enter'
})
```

### ✅ Usage Level
```tsx
// If someone tries to pass wrong type:
<StringFieldInput 
  onConfirm={(value: number) => ...}  // ❌ Type error
/>

// Correct:
<StringFieldInput 
  onConfirm={(value: string) => ...}  // ✅ OK
/>
```

### ✅ Hook Level
```tsx
// Hook ensures getValue and onConfirm match
useFieldConfirm<string>({
  getValue: () => 'hello',              // Returns string
  onConfirm: (value: string) => ...,    // Expects string ✅
})

useFieldConfirm<string>({
  getValue: () => 'hello',              // Returns string
  onConfirm: (value: number) => ...,    // ❌ Type error
})
```

---

## Benefits

1. **Component Type Safety** - Each field component has concrete types
2. **Hook Flexibility** - Generic hook works for all types
3. **Parent Simplicity** - Parent can use generic handler
4. **Compile-Time Safety** - TypeScript catches type mismatches
5. **Autocomplete** - IDEs provide correct type hints

---

## Example: Full Type Flow

```tsx
// 1. StringFieldInput defines concrete type
type Props = {
  onConfirm: (value: string) => void  // Component expects string
}

// 2. Component uses generic hook with type parameter
useFieldConfirm<string>({
  getValue: () => search,  // TS checks: search is string ✅
  onConfirm,               // TS checks: onConfirm expects string ✅
  keys: 'enter'
})

// 3. Parent passes generic handler
const handleConfirm = (value: unknown) => setValue(fieldId, value)
<StringFieldInput onConfirm={handleConfirm} />
// TS checks: (unknown) => void assignable to (string) => void ✅

// 4. At runtime
handleConfirm('hello')  // Works ✅
handleConfirm(123)      // Works (but component won't call with number)
```

---

## Summary

- ✅ **Field components have concrete types** (`string`, `number`, `string[]`, etc.)
- ✅ **Hook is generic** to support all field types
- ✅ **Parent uses `unknown`** for flexibility (type-safe via contravariance)
- ✅ **Full type safety** at compile time

**No sacrifice of type safety. Best of both worlds!** 🎉
