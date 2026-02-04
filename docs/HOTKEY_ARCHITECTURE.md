# Hotkey System Architecture

## Overview

The centralized hotkey system provides a type-safe, conflict-free way to manage keyboard shortcuts across the application. It replaces scattered hotkey definitions with a single source of truth, enabling automatic conflict detection, context-aware activation, and cross-platform support.

## Architecture Layers

### 1. Registry Layer (Single Source of Truth)

**Location**: `apps/extension/src/lib/hotkeys/registry.ts`

The registry is a centralized, compile-time validated configuration containing all application hotkeys.

**Key Components**:
- `HOTKEY_REGISTRY` - Const object with all hotkey definitions
- `HotkeyDefinition` - Interface defining hotkey metadata
- `HotkeyId` - Type-safe string literals for all hotkey IDs
- `HotkeyScope` - Enum of valid scope contexts
- `HotkeyCategory` - Organizational grouping for documentation

**Registry Structure**:
```typescript
{
  'hotkey.id': {
    id: 'hotkey.id',
    shortcut: { /* platform-specific keys */ },
    scopes: ['scope1', 'scope2'],
    category: 'category',
    description: 'Human-readable description',
    priority: 5,
    preventDefault: true,
    enableOnFormTags: false
  }
}
```

**Benefits**:
- Type-safe IDs with autocomplete
- Platform-specific key mappings (macOS/Windows)
- Centralized configuration eliminates duplication
- Build-time conflict detection via tests

### 2. Scope Layer (Context-Aware Activation)

**Location**: `apps/extension/src/lib/hotkeys/useScopeManager.ts`

Scopes control when hotkeys are active based on the current route/context.

**Available Scopes**:
- `global` - Always active (escape, help)
- `main-menu` - Root menu (/)
- `issue-menu` - Issue details (/ticket/:key)
- `issue-actions` - Issue action submenus
- `create-issue` - Create issue flow
- `field-input` - Field-level inputs

**Route-to-Scope Mapping**:
Routes are automatically mapped to scopes based on patterns. The scope manager:
1. Monitors route changes via `useLocation()`
2. Determines active scopes from route patterns
3. Enables/disables scopes via react-hotkeys-hook context
4. Cleans up on unmount/route change

**Scope Hierarchy**:
- Multiple scopes can be active simultaneously
- More specific scopes take precedence (field-input > create-issue > global)
- Scopes are additive (route can activate multiple)

### 3. API Layer (Developer Interface)

**Location**: `apps/extension/src/lib/hotkeys/`

Developer-friendly hooks that consume the registry and handle scope management.

**Primary APIs**:

#### `useHotkey(hotkeyId, callback, options?)`
Type-safe hook for registering hotkeys from the registry.

**Example**:
```typescript
useHotkey('global.escape', () => navigate(-1))
useHotkey('issue.assign', handleAssign, { enabled: canAssign })
```

#### `useFieldConfirm(options)`
Specialized hook for field input confirmation.

**Example**:
```typescript
useFieldConfirm({
  onConfirm: () => onConfirm(value),
  keys: 'enter' // or 'meta+enter'
})
```

## Key Design Patterns

### 1. Convention Over Configuration

Hotkey IDs follow a consistent naming pattern:
- `{scope}.{action}` - e.g., `global.escape`, `field.confirm-simple`
- Categories group related hotkeys: `navigation`, `field-input`, `issue-actions`, `clipboard`

### 2. Platform Abstraction

Platform-specific keys are resolved automatically:
- `cmd` → `meta` on macOS, `ctrl` on Windows
- `opt` → `option` on macOS, `alt` on Windows
- Keys defined once, work everywhere

### 3. Type Safety

TypeScript enforces correctness at compile time:
- `HotkeyId` type provides autocomplete
- Invalid hotkey IDs cause compile errors
- Scope types are validated

### 4. Conflict Prevention

Multiple layers of conflict detection:
- **Priority system**: Higher priority wins (default: 5)
- **Scope isolation**: Hotkeys in different scopes don't conflict
- **Build-time tests**: Automated conflict detection
- **Modifier specificity**: `cmd+enter` doesn't conflict with `enter`

## Data Flow

```
User presses key
    ↓
react-hotkeys-hook captures event
    ↓
Checks active scopes (from useScopeManager)
    ↓
Finds matching hotkey in active scopes
    ↓
Executes callback via useHotkey
```

## Integration Points

### Application Initialization

```typescript
// App.tsx
<HotkeysProvider>  {/* Initializes with 'global' scope */}
  <App />
</HotkeysProvider>
```

### Route-Based Scope Management

```typescript
// CommandLayout.tsx
useScopeManager()  {/* Auto-manages scopes based on route */}
```

### Component Usage

```typescript
// Any component
useHotkey('global.escape', handleEscape)
```

## Extension Points

### Adding New Hotkeys

1. Add definition to `HOTKEY_REGISTRY`
2. Use `useHotkey(newId, callback)` in components
3. Tests automatically validate for conflicts

### Adding New Scopes

1. Add to `HotkeyScope` type
2. Update `ROUTE_SCOPE_MAP` in useScopeManager
3. Define route pattern for automatic activation

### Cross-Platform Keys

Hotkeys automatically adapt to platform:
```typescript
{
  macOS: { modifiers: ['cmd', 'shift'], key: 'a' },
  Windows: { modifiers: ['alt', 'shift'], key: 'a' }
}
```

## Testing Strategy

### Conflict Detection Tests

```typescript
it('should not have conflicts on macOS', () => {
  const conflicts = detectConflicts('macOS')
  expect(conflicts).toEqual([])
})
```

### Registry Integrity Tests

- Unique IDs across all hotkeys
- Valid scopes for all definitions
- Non-empty descriptions
- Matching ID fields and keys

## Migration Strategy

The system was designed for **incremental migration**:

1. **Phase 1**: Create registry + API (non-breaking)
2. **Phase 2**: Integrate providers (parallel operation)
3. **Phase 3**: Migrate components one by one
4. **Phase 4**: Remove old hooks after 100% migration

**Current Status**:
- ✅ Registry and API created
- ✅ Providers integrated
- ✅ CommandSearch migrated
- ✅ All field components migrated
- ⏳ TicketActionsMenu (future)
- ⏳ TicketListMenu (future)

## Benefits Summary

### For Developers

- **Discoverability**: Autocomplete shows all available hotkeys
- **Type safety**: Invalid IDs caught at compile time
- **Easy to add**: Single location to define new hotkeys
- **No conflicts**: Automatic detection prevents clashes
- **Context-aware**: Scopes manage activation automatically

### For Users

- **Consistent behavior**: Same keys work across similar contexts
- **Platform-native**: Keys adapt to macOS/Windows conventions
- **No unexpected triggers**: Scope isolation prevents conflicts
- **Documented**: Auto-generated reference (docs/HOTKEYS.md)

## File Structure

```
apps/extension/src/lib/hotkeys/
├── index.ts                 # Public API exports
├── registry.ts              # Central hotkey definitions
├── conflict-detector.ts     # Build-time validation
├── HotkeysProvider.tsx      # React provider wrapper
├── useScopeManager.ts       # Route-based scope activation
├── useHotkey.ts            # Main developer API
├── useFieldConfirm.tsx     # Field confirmation helper
├── registry.test.ts        # Conflict detection tests
└── generate-docs.ts        # Documentation generator
```

## Future Enhancements

### Potential Extensions

1. **Dynamic hotkeys**: User-customizable key bindings
2. **Hotkey hints**: Overlay showing available keys in context
3. **Analytics**: Track hotkey usage patterns
4. **Command palette**: Search and execute actions by name
5. **Chord sequences**: Multi-key combinations (e.g., Cmd+K Cmd+S)

### Migration TODO

- Migrate `TicketActionsMenu.tsx` (~10 hotkeys)
- Migrate `TicketListMenu.tsx` (~3 hotkeys)
- Update `ActionShortcut.tsx` to accept `hotkeyId` prop
- Remove `useActionShortcut.ts` after migration

## References

- Registry: `apps/extension/src/lib/hotkeys/registry.ts`
- Documentation: `docs/HOTKEYS.md`
- Tests: `apps/extension/src/lib/hotkeys/registry.test.ts`
- react-hotkeys-hook: https://github.com/JohannesKlauss/react-hotkeys-hook
