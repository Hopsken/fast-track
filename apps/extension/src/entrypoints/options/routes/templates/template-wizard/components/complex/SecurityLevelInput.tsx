import type { SecurityLevelInputProps } from '../../types'
import { SingleSelectField } from '../select/SingleSelectField'

/**
 * Security level input (single select).
 * Reuses SingleSelectField for consistent UX.
 */
export function SecurityLevelInput({
  value,
  onChange,
  allowedValues,
  field
}: SecurityLevelInputProps) {
  return (
    <SingleSelectField
      fieldName={field?.name ?? 'security level'}
      allowedValues={allowedValues}
      value={value}
      onChange={onChange as (v: unknown) => void}
    />
  )
}
