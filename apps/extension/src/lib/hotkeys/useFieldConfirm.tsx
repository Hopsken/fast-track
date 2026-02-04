import { ReactNode } from 'react'

import { FieldConfirm as FieldConfirmButton } from '~/entrypoints/popup/menus/CreateIssue/FieldConfirm'

import { useHotkey } from './useHotkey'

/**
 * Hotkey patterns for field confirmation.
 * - 'enter': Simple fields (string, number, array)
 * - 'meta+enter': Complex fields (multi-select, combined, user select)
 */
type ConfirmKeys = 'enter' | 'meta+enter'

interface UseFieldConfirmOptions {
  /**
   * Called when the user confirms with valid input.
   */
  onConfirm: () => void

  /**
   * Which hotkey triggers confirmation.
   */
  keys: ConfirmKeys

  /**
   * Enable or disable hotkeys.
   * @default true
   */
  enabled?: boolean
}

/**
 * Registry-based field confirmation hook.
 *
 * Replaces the old useFieldConfirm with a version that uses
 * the centralized hotkey registry.
 *
 * Returns a React element (the confirmation button) to maintain
 * backward compatibility with existing field components.
 *
 * @example
 * ```tsx
 * // String field
 * useFieldConfirm({
 *   onConfirm: () => onConfirm(search),
 *   keys: 'enter'
 * })
 *
 * // Multi-select
 * useFieldConfirm({
 *   onConfirm: handleConfirm,
 *   keys: 'meta+enter'
 * })
 * ```
 */
export function useFieldConfirm({
  onConfirm,
  keys,
  enabled = true
}: UseFieldConfirmOptions): ReactNode {
  // Map keys to registry IDs
  const hotkeyId =
    keys === 'enter' ? 'field.confirm-simple' : 'field.confirm-complex'

  // Register hotkey using centralized registry
  useHotkey(hotkeyId, onConfirm, { enabled })

  // Return the confirmation button for backward compatibility
  return <FieldConfirmButton onClick={onConfirm} />
}
