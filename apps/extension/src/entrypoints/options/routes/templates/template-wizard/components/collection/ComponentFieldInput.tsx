import type { ComponentFieldInputProps } from '../../types'
import { MultiSelectChips } from '../select/MultiSelectChips'

/**
 * Component field input (multi-select).
 * Reuses MultiSelectChips for consistent UX.
 */
export function ComponentFieldInput({
  value,
  onChange,
  allowedValues
}: ComponentFieldInputProps) {
  return (
    <MultiSelectChips
      allowedValues={allowedValues}
      value={value}
      onChange={onChange as (v: unknown) => void}
    />
  )
}
