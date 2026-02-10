import { useState, useEffect, useCallback, DependencyList } from 'react'
import { useMount, useUnmount } from 'ahooks'
import {
  useHotkeys,
  Options,
  HotkeyCallback as ReactHotkeyCallback
} from 'react-hotkeys-hook'

import {
  KeyboardShortcut,
  KeyModifier,
  resolvePlatformShortcut
} from '@/lib/keyboard'

import { hotkeyPriorityManager } from './priority-manager'
import { HotkeyId, getHotkeyDefinition } from './registry'

/**
 * Callback function for hotkey activation.
 * Re-export from react-hotkeys-hook for consistency.
 */
export type HotkeyCallback = ReactHotkeyCallback

/**
 * Options for useHotkey hook.
 */
export interface UseHotkeyOptions extends Options {
  /** Enable or disable the hotkey (default: true) */
  enabled?: boolean
  /** Dependencies for the callback (like useCallback deps) */
  deps?: DependencyList
}

/**
 * Maps KeyModifier to react-hotkeys-hook format.
 * Converts 'cmd' to 'meta' for cross-platform compatibility.
 */
const mapModifierKey = (modifier: KeyModifier): string => {
  if (modifier === 'cmd') {
    return 'meta'
  }
  return modifier
}

/**
 * Converts a KeyboardShortcut to react-hotkeys-hook key string.
 *
 * @example
 * { modifiers: ['cmd', 'shift'], key: 'a' } => 'meta+shift+a'
 * { modifiers: [], key: 'enter' } => 'enter'
 */
const mapKeyboardShortcutToReactHotkeys = (
  shortcut: KeyboardShortcut
): string => {
  if (shortcut.modifiers.length === 0) {
    return shortcut.key
  }
  return `${shortcut.modifiers.map(mapModifierKey).join('+')}+${shortcut.key}`
}

/**
 * Type-safe hotkey hook that consumes the centralized registry.
 *
 * Benefits over direct useHotkeys:
 * - Type-safe hotkey IDs with autocomplete
 * - Automatic platform detection (macOS vs Windows)
 * - Centralized configuration (scopes, priorities, defaults)
 * - Consistent behavior across the app
 * - Build-time conflict detection
 * - Runtime priority enforcement via HotkeyPriorityManager
 *
 * @example
 * ```tsx
 * // Simple usage
 * useHotkey('global.escape', () => {
 *   navigate(-1)
 * })
 *
 * // With enabled flag
 * useHotkey('issue.assign', () => {
 *   assignToMe()
 * }, { enabled: canAssign })
 *
 * // With dependencies
 * useHotkey('field.confirm-simple', () => {
 *   handleConfirm(value)
 * }, { deps: [value] })
 * ```
 */
export function useHotkey(
  hotkeyId: HotkeyId,
  callback: HotkeyCallback,
  options: UseHotkeyOptions = {}
): void {
  const { deps, ...restOptions } = options

  // Get hotkey definition from registry
  const definition = getHotkeyDefinition(hotkeyId)

  // Resolve platform-specific shortcut
  const [shortcut] = useState(() =>
    resolvePlatformShortcut(definition.shortcut)
  )

  // Convert to react-hotkeys-hook format
  const keys = mapKeyboardShortcutToReactHotkeys(shortcut)

  // Register with priority manager (stable ID across re-renders)
  const [instanceId] = useState(() =>
    hotkeyPriorityManager.register({
      hotkeyId,
      normalizedKeys: keys,
      priority: definition.priority ?? 5,
      enabled: restOptions.enabled ?? true
    })
  )

  // Unregister on unmount
  useUnmount(() => {
    console.log('Unmount')
    hotkeyPriorityManager.unregister(instanceId)
  })
  // useEffect(() => {
  //   return () => {}
  // }, [instanceId])

  // Wrap callback with priority check
  const wrappedCallback: HotkeyCallback = useCallback(
    (keyboardEvent, hotkeysEvent) => {
      if (hotkeyPriorityManager.shouldExecute(instanceId)) {
        callback(keyboardEvent, hotkeysEvent)
      }
    },
    [instanceId, callback]
  )

  // Register hotkey with react-hotkeys-hook
  useHotkeys(
    keys,
    wrappedCallback,
    {
      ...restOptions,
      preventDefault: definition.preventDefault ?? true,
      enableOnFormTags: definition.enableOnFormTags ?? true,
      scopes: definition.scopes as string[]
    },
    deps
  )
}
