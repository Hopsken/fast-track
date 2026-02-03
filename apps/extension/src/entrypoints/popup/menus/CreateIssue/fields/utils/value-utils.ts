import type { AllowedValue } from '~/types/template'

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
