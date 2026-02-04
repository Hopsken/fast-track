// Core registry
export type {
  HotkeyScope,
  HotkeyCategory,
  HotkeyDefinition,
  HotkeyId
} from './registry'
export {
  HOTKEY_REGISTRY,
  getHotkeyDefinition,
  getHotkeysByScope,
  getHotkeysByCategory
} from './registry'

// Conflict detection
export type { ConflictReport } from './conflict-detector'
export {
  detectConflicts,
  formatConflictReport,
  assertNoConflicts
} from './conflict-detector'

// Provider and scope management
export { HotkeysProvider } from './HotkeysProvider'
export { HotkeysScope as HotkeysScopeProvider } from './HotkeysScopeProvider'
export { useScopeManager } from './useScopeManager'

// Developer API
export type { HotkeyCallback, UseHotkeyOptions } from './useHotkey'
export { useHotkey } from './useHotkey'

// Field confirmation helper
export { useFieldConfirm } from './useFieldConfirm'
