# Hotkey System

Scoped, priority-aware hotkeys built on `react-hotkeys-hook`.

**Files:** `src/lib/hotkeys/`, `src/lib/keyboard.ts`

## Architecture

1. **Registry** (`registry.ts`) — single source of truth. All hotkeys defined as `HOTKEY_REGISTRY` const object. Type-safe IDs via `HotkeyId`.
2. **Scopes** — activated per-screen via `<HotkeysScopeProvider scope="...">`. `global` always active.
3. **Priority Manager** (`priority-manager.ts`) — singleton resolving conflicts at runtime. Higher priority wins; equal priority → both execute.
4. **useHotkey** (`useHotkey.ts`) — main hook. Resolves platform shortcuts, registers with priority manager, wraps callback.
5. **keyboard.ts** — platform detection (`macOS`/`Windows`), shortcut resolution.

## Scopes

| Scope | When active |
|-------|-------------|
| `global` | Always |
| `main-menu` | Root menu |
| `issue-menu` | Issue detail view |
| `issue-actions` | Issue action submenu |
| `create-issue` | Create issue wizard review |
| `field-input` | Field-level inputs |

## Registry

| ID | macOS | Windows | Scopes | Pri |
|----|-------|---------|--------|-----|
| `global.escape` | Esc | Esc | global | 5 |
| `field.confirm-simple` | Enter | Enter | field-input | 5 |
| `field.confirm-complex` | ⌘Enter | Ctrl+Enter | field-input | 6 |
| `issue.create.proceed` | ⌘Enter | Ctrl+Enter | create-issue | 4 |
| `field-input.escape` | Esc | Esc | field-input | **10** |
| `issue.assign` | ⌘⇧A | Alt+Shift+A | main-menu, issue-menu | 5 |
| `issue.status` | ⌘⇧S | Alt+Shift+S | main-menu, issue-menu | 5 |
| `issue.priority` | ⌘⇧P | Alt+Shift+P | main-menu, issue-menu | 5 |
| `issue.assign-myself` | ⌘⇧M | Alt+Shift+M | issue-actions | 5 |
| `issue.unassign-myself` | ⌘⇧U | Alt+Shift+U | issue-actions | 5 |
| `clipboard.copy-key` | ⌘⇧K | Alt+Shift+K | issue-menu, issue-actions | 5 |
| `clipboard.copy-summary` | ⌘⇧T | Alt+Shift+T | issue-menu, issue-actions | 5 |
| `clipboard.copy-url` | ⌘⇧L | Alt+Shift+L | issue-menu, issue-actions | 5 |
| `clipboard.copy-branch` | ⌘⇧B | Alt+Shift+B | issue-menu, issue-actions | 5 |
| `clipboard.copy-markdown` | ⌘⇧C | Alt+Shift+C | issue-menu, issue-actions | 5 |
| `clipboard.copy-markdown-url` | ⌘⌥L | Alt+Ctrl+L | issue-menu, issue-actions | 5 |

## Priority Resolution

When multiple hotkeys share the same key combo and both scopes are active, **higher priority wins**. Key example:

- `field-input.escape` (priority **10**) beats `global.escape` (priority 5) when `field-input` scope is active.
- `field.confirm-complex` (priority 6) beats `issue.create.proceed` (priority 4) when both `field-input` and `create-issue` scopes are active.

Equal priority → both execute.

## Usage

```tsx
// Basic
useHotkey('issue.assign', () => assignUser())

// Conditional
useHotkey('issue.assign', () => assignUser(), { enabled: canAssign })

// With deps
useHotkey('field.confirm-simple', () => submit(value), { deps: [value] })

// Scope activation
<HotkeysScopeProvider scope="issue-menu">
  <MyMenu />
</HotkeysScopeProvider>
```
