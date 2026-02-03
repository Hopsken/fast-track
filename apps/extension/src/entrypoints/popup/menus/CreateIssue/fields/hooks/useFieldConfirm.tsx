import { useHotkeys } from 'react-hotkeys-hook'

import { FieldConfirm } from '../../FieldConfirm'

/**
 * Hotkey patterns for field confirmation.
 * - 'enter': Simple fields (string, number, array)
 * - 'meta+enter': Complex fields (multi-select, combined)
 * - 'both': Support both enter and meta+enter
 * - 'none': No hotkeys (click-only fields like single-select)
 */
type ConfirmKeys = 'enter' | 'meta+enter' | 'both' | 'none'

interface UseFieldConfirmOptions {
  /**
   * Called when the user confirms with valid input.
   */
  onConfirm: () => void

  /**
   * Which hotkeys trigger confirmation.
   * @default 'enter'
   */
  keys?: ConfirmKeys

  /**
   * Enable or disable hotkeys.
   * @default true
   */
  enabled?: boolean
}

/**
 * Composable hook for field input confirmation.
 *
 * Centralizes hotkey handling while delegating value formatting to field components.
 * Each field component provides its own `getValue` logic.
 *
 * @example
 * ```tsx
 * // String field (type inferred from getValue return)
 * useFieldConfirm({
 *   onConfirm, // () => void
 *   keys: 'enter'
 * })
 *
 * // Number field with validation
 * useFieldConfirm({
 *   onConfirm, // () => void
 *   keys: 'enter'
 * })
 *
 * // Multi-select (cmd+enter to finish)
 * useFieldConfirm({
 *   onConfirm, // () => void
 *   keys: 'meta+enter'
 * })
 *
 * // Click-only field
 * const { confirm } = useFieldConfirm({
 *   onConfirm, // () => void
 *   keys: 'none'
 * })
 * ```
 */
export function useFieldConfirm({
  onConfirm,
  keys = 'enter',
  enabled = true
}: UseFieldConfirmOptions) {
  // Register Enter hotkey
  useHotkeys('enter', onConfirm, {
    enabled: enabled && (keys === 'enter' || keys === 'both'),
    preventDefault: true,
    enableOnFormTags: true
  })

  // Register Meta+Enter hotkey
  useHotkeys('meta+enter', onConfirm, {
    enabled: enabled && (keys === 'meta+enter' || keys === 'both'),
    preventDefault: true,
    enableOnFormTags: true
  })

  return <FieldConfirm onClick={onConfirm} />
}
