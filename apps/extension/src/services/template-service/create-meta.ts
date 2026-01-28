import type { FieldMetadata } from '~/types/template'

/**
 * Jira createmeta can be returned as:
 * - { fields: FieldMetadata[] }
 * - FieldMetadata[]
 * - other shapes (unexpected)
 *
 * This helper centralizes parsing and guards against caching invalid/empty data.
 */
export function parseCreateMetaFields(input: unknown): FieldMetadata[] {
  // Array response
  if (Array.isArray(input)) return input as FieldMetadata[]

  // Object response with fields
  if (input && typeof input === 'object') {
    const maybeFields = (input as { fields?: unknown }).fields
    if (Array.isArray(maybeFields)) return maybeFields as FieldMetadata[]
  }

  return []
}

export function isValidCreateMetaFields(fields: FieldMetadata[]): boolean {
  // Avoid overwriting cache with empty data (commonly caused by permission errors or unexpected shapes)
  if (!Array.isArray(fields) || fields.length === 0) return false

  // Very light structural validation
  return fields.every((f) => {
    if (!f || typeof f !== 'object') return false
    const fieldId = (f as any).fieldId
    const key = (f as any).key
    const name = (f as any).name
    const schema = (f as any).schema
    return (
      typeof fieldId === 'string' &&
      fieldId.length > 0 &&
      typeof key === 'string' &&
      typeof name === 'string' &&
      schema &&
      typeof schema === 'object' &&
      typeof (schema as any).type === 'string'
    )
  })
}
