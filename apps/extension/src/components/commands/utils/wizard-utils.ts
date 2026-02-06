import { JiraFieldMetadata } from '@/repository/schema'
import type { VisibleField } from '~/services/template-service/gap-analysis'
import type { IssueTemplate } from '~/types/template'

import { asRecord } from './value-utils'

export function toCacheKey(template: IssueTemplate) {
  const {
    baseUrlHost,
    project: { key: projectKey },
    issueType: { id: issueTypeId }
  } = template.scope
  return `${baseUrlHost}:${projectKey}:${issueTypeId}`
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
  fieldsMetadata: JiraFieldMetadata[]
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
