import type { PageOfCreateMetaIssueTypeWithField } from 'jira.js/version3/models/pageOfCreateMetaIssueTypeWithField'

import type { FieldMetadata } from '~/types/template'

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value)
}

/**
 * Normalize Jira createmeta response into our FieldMetadata[].
 *
 * jira.js v3 endpoint (getCreateIssueMetaIssueTypeId) returns:
 *   PageOfCreateMetaIssueTypeWithField { fields?: FieldCreateMetadata[] }
 */
export function parseCreateMetaFields(
  input: PageOfCreateMetaIssueTypeWithField
): FieldMetadata[] {
  const list = input.fields ?? input.results ?? []
  if (!Array.isArray(list) || list.length === 0) return []

  const out: FieldMetadata[] = []

  const toField = (raw: unknown): FieldMetadata | null => {
    if (!raw || !isRecord(raw)) return null

    // FieldCreateMetadata id is the actual fieldId (e.g. 'summary', 'customfield_10010')
    const fieldId = typeof raw.fieldId === 'string' ? raw.fieldId : null
    if (!fieldId) return null

    const key = typeof raw.key === 'string' ? raw.key : fieldId
    const name = typeof raw.name === 'string' ? raw.name : key
    const required = typeof raw.required === 'boolean' ? raw.required : false

    const schema = isRecord(raw.schema) ? raw.schema : null
    if (!schema || typeof schema.type !== 'string') return null

    return {
      fieldId,
      key,
      name,
      required,
      schema: schema as unknown as FieldMetadata['schema'],
      allowedValues: Array.isArray(raw.allowedValues)
        ? (raw.allowedValues as FieldMetadata['allowedValues'])
        : undefined,
      autoCompleteUrl:
        typeof raw.autoCompleteUrl === 'string'
          ? raw.autoCompleteUrl
          : undefined,
      hasDefaultValue:
        typeof raw.hasDefaultValue === 'boolean'
          ? raw.hasDefaultValue
          : undefined,
      defaultValue: (raw as { defaultValue?: unknown }).defaultValue
    }
  }

  for (const raw of list) {
    const field = toField(raw)
    if (field) out.push(field)
  }

  return out
}

export function isValidCreateMetaFields(fields: FieldMetadata[]): boolean {
  if (!Array.isArray(fields) || fields.length === 0) return false

  return fields.every((f) => {
    return (
      typeof f.fieldId === 'string' &&
      f.fieldId.length > 0 &&
      typeof f.key === 'string' &&
      typeof f.name === 'string' &&
      !!f.schema &&
      typeof f.schema === 'object' &&
      typeof f.schema.type === 'string'
    )
  })
}
