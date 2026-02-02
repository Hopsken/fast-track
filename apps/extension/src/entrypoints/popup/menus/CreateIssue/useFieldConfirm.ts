import { useMemoizedFn } from 'ahooks'
import { useHotkeys } from 'react-hotkeys-hook'

/**
 * Return type for getValue callback.
 * - Return the value to confirm
 * - Return { skip: true } to prevent confirmation (e.g., invalid input)
 */
type GetValueResult<T> = T | { skip: true }

/**
 * Hotkey patterns for field confirmation.
 * - 'enter': Simple fields (string, number, array)
 * - 'meta+enter': Complex fields (multi-select, combined)
 * - 'both': Support both enter and meta+enter
 * - 'none': No hotkeys (click-only fields like single-select)
 */
type ConfirmKeys = 'enter' | 'meta+enter' | 'both' | 'none'

interface UseFieldConfirmOptions<T = unknown> {
  /**
   * Callback to get the current value from the field component.
   * The field component owns the logic for formatting/validating input.
   *
   * Return { skip: true } to prevent confirmation (e.g., invalid input).
   */
  getValue: () => GetValueResult<T>

  /**
   * Called when the user confirms with valid input.
   */
  onConfirm: (value: T) => void

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
 * useFieldConfirm<string>({
 *   getValue: () => search.trim(),
 *   onConfirm, // (value: string) => void
 *   keys: 'enter'
 * })
 *
 * // Number field with validation
 * useFieldConfirm<number | undefined>({
 *   getValue: () => {
 *     const num = Number(search)
 *     return Number.isFinite(num) ? num : { skip: true }
 *   },
 *   onConfirm, // (value: number | undefined) => void
 *   keys: 'enter'
 * })
 *
 * // Multi-select (cmd+enter to finish)
 * useFieldConfirm<MyItemType[]>({
 *   getValue: () => selectedItems,
 *   onConfirm, // (value: MyItemType[]) => void
 *   keys: 'meta+enter'
 * })
 *
 * // Click-only field
 * const { confirm } = useFieldConfirm<User>({
 *   getValue: () => selectedUser,
 *   onConfirm, // (value: User) => void
 *   keys: 'none'
 * })
 * ```
 */
export function useFieldConfirm<T = unknown>({
  getValue,
  onConfirm,
  keys = 'enter',
  enabled = true
}: UseFieldConfirmOptions<T>) {
  const handleConfirm = useMemoizedFn(() => {
    const result = getValue()

    // Check if field says "skip" (invalid input)
    if (result && typeof result === 'object' && 'skip' in result) {
      return
    }

    onConfirm(result)
  })

  // Register Enter hotkey
  useHotkeys(
    'enter',
    handleConfirm,
    {
      enabled: enabled && (keys === 'enter' || keys === 'both'),
      preventDefault: true,
      enableOnFormTags: true
    },
    [handleConfirm]
  )

  // Register Meta+Enter hotkey
  useHotkeys(
    'meta+enter',
    handleConfirm,
    {
      enabled: enabled && (keys === 'meta+enter' || keys === 'both'),
      preventDefault: true,
      enableOnFormTags: true
    },
    [handleConfirm]
  )

  // Return manual confirm for click handlers
  return { confirm: handleConfirm }
}
