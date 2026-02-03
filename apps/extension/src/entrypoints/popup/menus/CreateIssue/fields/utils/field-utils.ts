import type { VisibleField } from '~/services/template-service/gap-analysis'
import type { FieldMetadata } from '~/types/template'

export function getFieldName(
  fieldId: string,
  metadata?: FieldMetadata
): string {
  return metadata?.name ?? fieldId
}

export function getFieldTitle(field: VisibleField): string {
  return field.metadata?.name ?? field.fieldId
}

export function hasAllowedValues(field: VisibleField): boolean {
  return (
    (field.allowedOptions?.length ?? 0) > 0 ||
    (field.metadata?.allowedValues?.length ?? 0) > 0
  )
}
