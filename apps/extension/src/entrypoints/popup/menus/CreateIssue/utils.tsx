import { ReactNode } from 'react'
import { isEmpty, mapValues } from 'lodash-es'

import { getFieldAdapter } from '@/common/fields'
import { JiraDescriptionAdapter } from '@/common/fields/adapters/description'
import { FieldAdapter } from '@/common/fields/types'
import { IssueTemplate, JiraFieldMetadata } from '@/repository/schema'
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
    return value
      .map((v) => formatValuePreview(v, adapter))
      .map((preview, index) => {
        if (typeof preview === 'string') {
          return (
            <span key={preview} className="mr-1 inline-block">
              {preview}
              {index < value.length - 1 ? ',&nbsp;' : ''}
            </span>
          )
        }
        return preview
      })
  }

  return adapter.labelOf?.(value) ?? adapter.keyOf(value)
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
  template: IssueTemplate,
  visibleFields: VisibleField[],
  values: Record<string, unknown>
): Record<string, unknown> {
  const fieldValues = mapValues(values, (value, fieldId) => {
    const field = visibleFields.find((f) => f.fieldId === fieldId)
    if (!field) return value

    const adapter = getFieldAdapter(field.metadata.schema)

    if (!adapter) return value

    return Array.isArray(value)
      ? value.map((val) => adapter.toDTO(val))
      : adapter.toDTO(value)
  })

  return {
    ...fieldValues,
    project: { id: template.scope.project.id },
    issuetype: { id: template.scope.issueType.id },
    summary: values['summary'] ?? '',
    description: JiraDescriptionAdapter.toDTO(values['description'] as string)
  }
}
