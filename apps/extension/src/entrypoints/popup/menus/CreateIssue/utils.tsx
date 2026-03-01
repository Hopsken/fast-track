import { ReactNode } from 'react'
import { isEmpty, mapValues } from 'lodash-es'

import { getFieldAdapter } from '@/common/fields'
import { resolveTemporalValue } from '@/common/fields/adapters/shared/date/resolvePreset'
import { FieldAdapter } from '@/common/fields/types'
import { JiraFieldMetadata } from '@/repository/schema'
import { VisibleField } from '@/services/template-service/gap-analysis'
import { isNonNullable } from '@/utils/assert'

export function isEmptyValue(
  value: unknown,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  adapter?: FieldAdapter<any>
): boolean {
  if (value === undefined || value === null) return true
  if (typeof value === 'string') return value.trim().length === 0
  if (Array.isArray(value)) {
    if (!value.length) return true
    return value.every((item) => isEmptyValue(item, adapter))
  }

  // use adapter if available
  return adapter ? !adapter.toDTO(value) : isEmpty(value)
}

export function formatValuePreview(
  value: unknown, // eslint-disable-next-line @typescript-eslint/no-explicit-any
  adapter: FieldAdapter<any>
): ReactNode {
  if (value == null) return ''

  if (Array.isArray(value)) {
    const labels = value
      .map(
        (v) =>
          (adapter.semanticLabelOf ?? adapter.labelOf)?.(v) ?? adapter.keyOf(v)
      )
      .map((label) => label.trim())
      .filter(Boolean)

    if (labels.length === 0) return ''

    const maxItems = 2
    const shown = labels.slice(0, maxItems)
    const restCount = labels.length - shown.length
    const joined = shown.join(', ')

    if (restCount <= 0) return joined

    return (
      <span className="min-w-0">
        {joined}{' '}
        <span className="text-muted-foreground tabular-nums">+{restCount}</span>
      </span>
    )
  }

  return (
    (adapter.semanticLabelOf ?? adapter.labelOf)?.(value) ??
    adapter.keyOf(value)
  )
}

export function buildInitialValues(
  fields: VisibleField[]
): Record<string, unknown> {
  const values: Record<string, unknown> = {
    summary: '',
    description: ''
  }

  for (const field of fields) {
    const presetValue = field.config?.presetValue
    if (!presetValue) continue

    // TU-56: resolve preset keys / ISO literals once at draft init (WYSIWYG)
    if (typeof presetValue === 'string') {
      const schemaType = field.metadata.schema.type

      if (schemaType === 'date' || schemaType === 'datetime') {
        const result = resolveTemporalValue(
          presetValue,
          schemaType as 'date' | 'datetime'
        )
        if (result.ok) {
          values[field.fieldId] = result.iso
          continue
        }
      }
    }

    values[field.fieldId] = presetValue
  }
  return values
}

export function computePromotedFields(args: {
  fieldsMetadata: JiraFieldMetadata[]
  promotedFieldIds: string[]
}): VisibleField[] {
  const { promotedFieldIds, fieldsMetadata } = args

  return promotedFieldIds
    .map((fieldId) => {
      const metadata = fieldsMetadata.find((f) => f.fieldId === fieldId)
      if (!metadata) return null
      return { fieldId, metadata, isEditable: true }
    })
    .filter(isNonNullable)
}

/**
 * Returns the drill-in field order for the hub UI.
 *
 * Summary is edited directly in the hub search input, so it's excluded here.
 */
export function computeWizardSequence(
  visibleFields: VisibleField[]
): VisibleField[] {
  const rest = visibleFields.filter((f) => f.fieldId !== 'summary')

  const required = rest.filter((f) => f.metadata?.required)
  const optional = rest.filter((f) => !f.metadata?.required)

  return [...required, ...optional]
}

export function extractJiraFieldErrors(
  errors: unknown
): Record<string, string> | null {
  if (!errors || typeof errors !== 'object') return null

  const record = errors as Record<string, unknown>
  const out: Record<string, string> = {}
  for (const [k, v] of Object.entries(record)) {
    if (typeof v !== 'string') return null
    out[k] = v
  }
  return out
}

export function buildCreateIssueFields(
  wizardFields: VisibleField[],
  values: Record<string, unknown>
): Record<string, unknown> {
  return mapValues(values, (value, fieldId) => {
    const field = wizardFields.find((f) => f.fieldId === fieldId)
    if (!field) return value

    const adapter = getFieldAdapter(field.metadata.schema)
    if (!adapter) return value

    return Array.isArray(value)
      ? value.map((val) => adapter.toDTO(val))
      : adapter.toDTO(value)
  })
}
