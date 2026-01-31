import type { VisibleField } from '~/services/template-service/gap-analysis'
import type { FieldMetadata, IssueTemplate } from '~/types/template'

export function toCacheKey(template: IssueTemplate) {
  const { baseUrlHost, projectKey, issueTypeId } = template.scope
  return `${baseUrlHost}:${projectKey}:${issueTypeId}`
}

export function getFieldName(fieldId: string, metadata?: FieldMetadata) {
  return metadata?.name ?? fieldId
}

const asRecord = (v: unknown): Record<string, unknown> | null =>
  v && typeof v === 'object' ? (v as Record<string, unknown>) : null

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

export function buildInitialValues(args: {
  template: IssueTemplate
  visibleFields: VisibleField[]
}) {
  const { template, visibleFields } = args
  const initial: Record<string, unknown> = {
    summary: '',
    description: template.descriptionTemplate ?? ''
  }

  for (const f of visibleFields) {
    if (f.presetValue !== undefined) {
      initial[f.fieldId] = f.presetValue
    }
  }

  return initial
}

export function computeFinalVisibleFields(args: {
  base: VisibleField[]
  promotedFieldIds: string[]
  cacheFields: FieldMetadata[]
}): VisibleField[] {
  const { base, promotedFieldIds, cacheFields } = args
  if (promotedFieldIds.length === 0) return base

  const existing = new Set(base.map((f) => f.fieldId))
  const promoted: VisibleField[] = []

  for (const fieldId of promotedFieldIds) {
    if (existing.has(fieldId)) continue
    const metadata = cacheFields.find((f) => f.fieldId === fieldId)
    promoted.push({ fieldId, metadata, isEditable: true })
  }

  return [...base, ...promoted]
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
