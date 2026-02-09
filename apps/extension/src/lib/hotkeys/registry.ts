import type { HotkeyCategory, HotkeyDefinition, HotkeyScope } from './types'

export type { HotkeyScope, HotkeyCategory, HotkeyDefinition } from './types'

/**
 * Central registry of all application hotkeys.
 * This is the single source of truth for all keyboard shortcuts.
 *
 * Benefits:
 * - Type-safe hotkey IDs (autocomplete)
 * - Build-time conflict detection
 * - Auto-generated documentation
 * - Centralized management
 */
export const HOTKEY_REGISTRY = {
  // ============================================================================
  // Global Navigation
  // ============================================================================
  'global.escape': {
    id: 'global.escape',
    shortcut: { modifiers: [], key: 'escape' },
    scopes: ['global'],
    category: 'navigation',
    description: 'Clear input, go back, or close popup (context-aware)',
    priority: 5,
    preventDefault: true,
    enableOnFormTags: true
  },

  // ============================================================================
  // Field Input Confirmation
  // ============================================================================
  'field.confirm-simple': {
    id: 'field.confirm-simple',
    shortcut: { modifiers: [], key: 'enter' },
    scopes: ['field-input'],
    category: 'field-input',
    description: 'Confirm simple field input (string, number, array)',
    priority: 5,
    preventDefault: true,
    enableOnFormTags: true
  },

  'field.confirm-complex': {
    id: 'field.confirm-complex',
    shortcut: {
      macOS: { modifiers: ['cmd'], key: 'enter' },
      Windows: { modifiers: ['ctrl'], key: 'enter' }
    },
    scopes: ['field-input'],
    category: 'field-input',
    description: 'Confirm complex field input (select, multi-select)',
    priority: 6,
    preventDefault: true,
    enableOnFormTags: true
  },

  'issue.create.proceed': {
    id: 'issue.create.proceed',
    shortcut: {
      macOS: { modifiers: ['cmd'], key: 'enter' },
      Windows: { modifiers: ['ctrl'], key: 'enter' }
    },
    scopes: ['create-issue'],
    category: 'field-input',
    description: 'Confirm fields value and proceed to create issue',
    priority: 4,
    preventDefault: true,
    enableOnFormTags: true
  },

  'field-input.escape': {
    id: 'field-input.escape',
    shortcut: { modifiers: [], key: 'escape' },
    scopes: ['field-input'],
    category: 'field-input',
    description: 'Go back to fields menu',
    priority: 10,
    preventDefault: true,
    enableOnFormTags: true
  },

  // ============================================================================
  // Issue Actions
  // ============================================================================
  'issue.assign': {
    id: 'issue.assign',
    shortcut: {
      macOS: { modifiers: ['cmd', 'shift'], key: 'a' },
      Windows: { modifiers: ['alt', 'shift'], key: 'a' }
    },
    scopes: ['main-menu', 'issue-menu'],
    category: 'issue-actions',
    description: 'Assign issue to user',
    priority: 5,
    preventDefault: true,
    enableOnFormTags: true
  },

  'issue.status': {
    id: 'issue.status',
    shortcut: {
      macOS: { modifiers: ['cmd', 'shift'], key: 's' },
      Windows: { modifiers: ['alt', 'shift'], key: 's' }
    },
    scopes: ['main-menu', 'issue-menu'],
    category: 'issue-actions',
    description: 'Change issue status',
    priority: 5,
    preventDefault: true,
    enableOnFormTags: true
  },

  'issue.priority': {
    id: 'issue.priority',
    shortcut: {
      macOS: { modifiers: ['cmd', 'shift'], key: 'p' },
      Windows: { modifiers: ['alt', 'shift'], key: 'p' }
    },
    scopes: ['main-menu', 'issue-menu'],
    category: 'issue-actions',
    description: 'Change issue priority',
    priority: 5,
    preventDefault: true,
    enableOnFormTags: true
  },

  'issue.assign-myself': {
    id: 'issue.assign-myself',
    shortcut: {
      macOS: { modifiers: ['cmd', 'shift'], key: 'm' },
      Windows: { modifiers: ['alt', 'shift'], key: 'm' }
    },
    scopes: ['issue-actions'],
    category: 'issue-actions',
    description: 'Assign issue to myself',
    priority: 5,
    preventDefault: true,
    enableOnFormTags: true
  },

  'issue.unassign-myself': {
    id: 'issue.unassign-myself',
    shortcut: {
      macOS: { modifiers: ['cmd', 'shift'], key: 'u' },
      Windows: { modifiers: ['alt', 'shift'], key: 'u' }
    },
    scopes: ['issue-actions'],
    category: 'issue-actions',
    description: 'Unassign issue from myself',
    priority: 5,
    preventDefault: true,
    enableOnFormTags: true
  },

  // ============================================================================
  // Clipboard Operations
  // ============================================================================
  'clipboard.copy-key': {
    id: 'clipboard.copy-key',
    shortcut: {
      macOS: { modifiers: ['cmd', 'shift'], key: 'k' },
      Windows: { modifiers: ['alt', 'shift'], key: 'k' }
    },
    scopes: ['issue-menu', 'issue-actions'],
    category: 'clipboard',
    description: 'Copy issue key to clipboard',
    priority: 5,
    preventDefault: true,
    enableOnFormTags: true
  },

  'clipboard.copy-summary': {
    id: 'clipboard.copy-summary',
    shortcut: {
      macOS: { modifiers: ['cmd', 'shift'], key: 't' },
      Windows: { modifiers: ['alt', 'shift'], key: 't' }
    },
    scopes: ['issue-menu', 'issue-actions'],
    category: 'clipboard',
    description: 'Copy issue summary (title) to clipboard',
    priority: 5,
    preventDefault: true,
    enableOnFormTags: true
  },

  'clipboard.copy-url': {
    id: 'clipboard.copy-url',
    shortcut: {
      macOS: { modifiers: ['cmd', 'shift'], key: 'l' },
      Windows: { modifiers: ['alt', 'shift'], key: 'l' }
    },
    scopes: ['issue-menu', 'issue-actions'],
    category: 'clipboard',
    description: 'Copy issue URL to clipboard',
    priority: 5,
    preventDefault: true,
    enableOnFormTags: true
  },

  'clipboard.copy-branch': {
    id: 'clipboard.copy-branch',
    shortcut: {
      macOS: { modifiers: ['cmd', 'shift'], key: 'b' },
      Windows: { modifiers: ['alt', 'shift'], key: 'b' }
    },
    scopes: ['issue-menu', 'issue-actions'],
    category: 'clipboard',
    description: 'Copy git branch name to clipboard',
    priority: 5,
    preventDefault: true,
    enableOnFormTags: true
  },

  'clipboard.copy-markdown': {
    id: 'clipboard.copy-markdown',
    shortcut: {
      macOS: { modifiers: ['cmd', 'shift'], key: 'c' },
      Windows: { modifiers: ['alt', 'shift'], key: 'c' }
    },
    scopes: ['issue-menu', 'issue-actions'],
    category: 'clipboard',
    description: 'Copy issue as markdown link',
    priority: 5,
    preventDefault: true,
    enableOnFormTags: true
  },

  'clipboard.copy-markdown-url': {
    id: 'clipboard.copy-markdown-url',
    shortcut: {
      macOS: { modifiers: ['cmd', 'opt'], key: 'l' },
      Windows: { modifiers: ['alt', 'ctrl'], key: 'l' }
    },
    scopes: ['issue-menu', 'issue-actions'],
    category: 'clipboard',
    description: 'Copy issue URL as markdown link',
    priority: 5,
    preventDefault: true,
    enableOnFormTags: true
  }
} as const satisfies Record<string, HotkeyDefinition>

/**
 * Type-safe hotkey IDs extracted from registry.
 * Use this type for autocomplete when calling useHotkey.
 */
export type HotkeyId = keyof typeof HOTKEY_REGISTRY

/**
 * Get hotkey definition by ID.
 */
export function getHotkeyDefinition(id: HotkeyId): HotkeyDefinition {
  return HOTKEY_REGISTRY[id]
}

/**
 * Get all hotkeys for a specific scope.
 */
export function getHotkeysByScope(scope: HotkeyScope): HotkeyDefinition[] {
  return Object.values(HOTKEY_REGISTRY).filter((hotkey) =>
    (hotkey.scopes as readonly HotkeyScope[]).includes(scope)
  )
}

/**
 * Get all hotkeys for a specific category.
 */
export function getHotkeysByCategory(
  category: HotkeyCategory
): HotkeyDefinition[] {
  return Object.values(HOTKEY_REGISTRY).filter(
    (hotkey) => hotkey.category === category
  )
}
