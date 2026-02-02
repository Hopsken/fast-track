import type { VisibleField } from '~/services/template-service/gap-analysis'
import type {
  AllowedValue,
  FieldMetadata,
  IssueTemplate
} from '~/types/template'

export function toCacheKey(template: IssueTemplate) {
  const {
    baseUrlHost,
    project: { key: projectKey },
    issueType: { id: issueTypeId }
  } = template.scope
  return `${baseUrlHost}:${projectKey}:${issueTypeId}`
}

export function getFieldName(fieldId: string, metadata?: FieldMetadata) {
  return metadata?.name ?? fieldId
}

export const asRecord = (v: unknown): Record<string, unknown> | null =>
  v && typeof v === 'object' ? (v as Record<string, unknown>) : null

export function isArrayOfAllowedValues(
  value: unknown
): value is AllowedValue[] {
  return (
    Array.isArray(value) &&
    value.every((v) => {
      const rec = asRecord(v)
      return !!rec && typeof rec.id === 'string'
    })
  )
}

export function isEmptyValue(value: unknown): boolean {
  if (value === undefined || value === null) return true
  if (typeof value === 'string') return value.trim().length === 0
  if (Array.isArray(value)) return value.length === 0

  const rec = asRecord(value)
  if (rec) {
    const id = rec.id
    if (typeof id === 'string') return id.length === 0

    const accountId = rec.accountId
    if (typeof accountId === 'string') return accountId.length === 0
  }

  return false
}

export function formatValuePreview(value: unknown): string {
  if (value === undefined || value === null) return ''
  if (typeof value === 'string') return value
  if (typeof value === 'number') return String(value)

  if (Array.isArray(value)) {
    return value
      .map((v) => formatValuePreview(v))
      .filter(Boolean)
      .join(', ')
  }

  const rec = asRecord(value)
  if (rec) {
    if (typeof rec.name === 'string') return rec.name
    if (typeof rec.value === 'string') return rec.value
    if (typeof rec.displayName === 'string') return rec.displayName
    if (typeof rec.id === 'string') return rec.id
  }

  return ''
}

export function pickNonEmptyValues(values: Record<string, unknown>) {
  const out: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(values)) {
    if (isEmptyValue(v)) continue
    out[k] = v
  }
  return out
}

export function buildInitialValues(template: IssueTemplate) {
  const initial: Record<string, unknown> = {
    summary: '',
    description: ''
  }

  // Extract all preset values directly from template config
  for (const [fieldId, config] of Object.entries(template.fields)) {
    if (config.behavior === 'preset') {
      initial[fieldId] = config.presetValue
    }
  }

  return initial
}

export function computePromotedFields(args: {
  fieldsMetadata: FieldMetadata[]
  promotedFieldIds: string[]
}): VisibleField[] {
  const { promotedFieldIds, fieldsMetadata } = args

  return promotedFieldIds.map((fieldId) => {
    const metadata = fieldsMetadata.find((f) => f.fieldId === fieldId)
    return { fieldId, metadata, isEditable: true }
  })
}

export function extractJiraFieldErrors(
  error: unknown
): Record<string, string> | null {
  const err = asRecord(error)
  const response = asRecord(err?.response)
  const data = asRecord(response?.data)
  const errors = data?.errors

  if (!errors || typeof errors !== 'object') return null

  const record = errors as Record<string, unknown>
  const out: Record<string, string> = {}
  for (const [k, v] of Object.entries(record)) {
    if (typeof v !== 'string') return null
    out[k] = v
  }
  return out
}

/**
 * Returns the wizard step order:
 *   1. Summary (combined with Description — one step)
 *   2. Required fields (metadata.required === true)
 *   3. Optional fields
 * Description is excluded as a standalone step; it's edited alongside Summary.
 */
export function computeWizardSequence(
  visibleFields: VisibleField[]
): VisibleField[] {
  const summaryField = visibleFields.find((f) => f.fieldId === 'summary')

  const rest = visibleFields.filter(
    (f) => f.fieldId !== 'summary' && f.fieldId !== 'description'
  )

  const required = rest.filter((f) => f.metadata?.required)
  const optional = rest.filter((f) => !f.metadata?.required)

  return [...(summaryField ? [summaryField] : []), ...required, ...optional]
}
