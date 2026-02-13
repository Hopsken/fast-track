# Navigation System

Stack-based navigation via a module-level Zustand store.

**File:** `src/common/commands/navigation.tsx`

## How It Works

`NavigationProvider` renders the top of the stack, or falls back to `children` (root menu) when empty.

```
push(<IssueMenu />, onPop)  →  stack: [IssueMenu]
push(<AssignMenu />)         →  stack: [IssueMenu, AssignMenu]  ← user sees this
pop()                        →  stack: [IssueMenu]              ← calls AssignMenu's onPop
pop()                        →  stack: []                       ← calls IssueMenu's onPop → root
```

`pop(step)` removes `|step|` items. Default is -1. Calls `onPop()` for each popped item in reverse order.

## Exports

| Export | Purpose |
|--------|---------|
| `NavigationProvider` | Renders top-of-stack or children |
| `useNavigation()` | `{ push, pop }` |
| `useIsNavigationRoot()` | `true` when stack empty |
| `NavigateBackProvider` | Context to override back behavior |
| `useNavigateBack()` | Returns custom `onNavigateBack` or `undefined` |

## Custom Back

`NavigateBackProvider` lets a subtree override what "back" means. Used by the CreateIssue wizard so Escape returns to the field review screen instead of popping the entire wizard.

```tsx
<NavigateBackProvider onNavigateBack={goBackToFieldsMenu}>
  <FieldInputMenu />
</NavigateBackProvider>
```

`ActionSearch` checks `useNavigateBack()` first; falls back to `navigate.pop()`.

## Key Behaviors

- `exitOnSelect` (default `true` on `Action`) auto-pops after action fires. `ActionPush` and `ActionCopyToClipboard` force it `false`.
- `ActionPanelFooter` lives **outside** `NavigationProvider` so it persists across all screens.
