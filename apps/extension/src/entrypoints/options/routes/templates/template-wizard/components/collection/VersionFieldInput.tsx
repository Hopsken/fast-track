import type { VersionFieldInputProps } from '../../types'
import { MultiSelectChips } from '../select/MultiSelectChips'

/**
 * Version field input (multi-select).
 * Reuses MultiSelectChips for consistent UX.
 */
export function VersionFieldInput({
  value,
  onChange,
  allowedValues
}: VersionFieldInputProps) {
  return (
    <MultiSelectChips
      allowedValues={allowedValues}
      value={value}
      onChange={onChange as (v: unknown) => void}
    />
  )
}
