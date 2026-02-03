import type { VisibleField } from '~/services/template-service/gap-analysis'

/**
 * Standard props interface for all field input components.
 * Each field component receives the field metadata, current value, and confirmation handler.
 */
export interface FieldInputProps {
  field: VisibleField
  currentValue: unknown
  onConfirm: (value: unknown) => void
}
