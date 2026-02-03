import type { GroupFieldInputProps } from '../../types'
import { MultiSelectChips } from '../select/MultiSelectChips'

/**
 * Group field input (multi-select).
 * Reuses MultiSelectChips for consistent UX.
 */
export function GroupFieldInput({
  value,
  onChange,
  allowedValues
}: GroupFieldInputProps) {
  return (
    <MultiSelectChips
      allowedValues={allowedValues}
      value={value}
      onChange={onChange as (v: unknown) => void}
    />
  )
}
