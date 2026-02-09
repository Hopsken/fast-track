import { KeyboardShortcutInput } from '@/lib/keyboard'

/**
 * Hotkey scopes define when hotkeys are active.
 * Scopes are managed automatically based on route navigation.
 */
export type HotkeyScope =
  | 'global' // Always active (escape, help)
  | 'main-menu' // Root menu (/)
  | 'issue-menu' // Issue details (/ticket/:key)
  | 'issue-actions' // Issue action submenu
  | 'create-issue' // Create issue flow
  | 'field-input' // Field-level inputs

/**
 * Hotkey categories for organization and documentation.
 */
export type HotkeyCategory =
  | 'navigation' // Menu navigation, back, escape
  | 'field-input' // Field confirmation
  | 'issue-actions' // Issue-specific actions (assign, status, etc.)
  | 'clipboard' // Copy operations
  | 'global' // Global shortcuts

/**
 * Core hotkey definition.
 * Each hotkey is identified by a unique ID and contains metadata
 * for binding, scoping, and documentation.
 */
export interface HotkeyDefinition {
  /** Unique identifier for this hotkey */
  id: string
  /** Keyboard shortcut (platform-specific or universal) */
  shortcut: KeyboardShortcutInput
  /** Scopes where this hotkey is active */
  scopes: HotkeyScope[]
  /** Category for organization */
  category: HotkeyCategory
  /** Human-readable description */
  description: string
  /** Higher priority wins in conflicts (default: 5) */
  priority?: number
  /** Prevent default browser behavior (default: true) */
  preventDefault?: boolean
  /** Enable in form inputs (default: false) */
  enableOnFormTags?: boolean
}

/**
 * Options for registering a hotkey instance with the priority manager.
 */
export interface RegisterHotkeyOptions {
  hotkeyId: string
  normalizedKeys: string
  priority: number
  enabled: boolean
}
