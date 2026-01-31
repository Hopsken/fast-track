import { keyBy } from 'lodash-es'

import type {
  AllowedValue,
  CachedFieldMetadata,
  FieldMetadata,
  IssueTemplate
} from '~/types/template'

type AdfDoc = {
  type: 'doc'
  version: 1
  content: Array<{
    type: 'paragraph'
    content: Array<{ type: 'text'; text: string }>
  }>
}

export function toAdfDoc(text: string): AdfDoc {
  return {
    type: 'doc',
    version: 1,
    content: [
      {
        type: 'paragraph',
        content: [{ type: 'text', text }]
      }
    ]
  }
}

const asRecord = (v: unknown): Record<string, unknown> | null =>
  v && typeof v === 'object' ? (v as Record<string, unknown>) : null

const isAllowedValue = (v: unknown): v is AllowedValue => {
  const rec = asRecord(v)
  if (!rec) return false
  return typeof rec.id === 'string'
}

function formatOption(value: unknown): unknown {
  if (!value) return value
  if (isAllowedValue(value)) return { id: value.id }

  const rec = asRecord(value)
  if (rec && typeof rec.id === 'string') {
    return { id: rec.id }
  }

  return value
}

function formatUser(value: unknown): unknown {
  if (!value) return value

  const rec = asRecord(value)
  if (rec && typeof rec.accountId === 'string') {
    return { accountId: rec.accountId }
  }

  return value
}

function formatArray(value: unknown, items: string | undefined): unknown {
  if (!Array.isArray(value)) return value

  if (
    items === 'option' ||
    items === 'component' ||
    items === 'version' ||
    items === 'priority' ||
    items === 'resolution'
  ) {
    return value.map((v) => formatOption(v))
  }

  // labels are usually string[]
  if (items === 'string') {
    return value
  }

  return value
}

export function formatCreateIssueFieldValue(input: {
  fieldId: string
  value: unknown
  metadata?: FieldMetadata
}): unknown {
  const { fieldId, value, metadata } = input

  if (fieldId === 'description') {
    if (typeof value === 'string' && value.trim().length > 0) {
      return toAdfDoc(value)
    }
    return value
  }

  const type = metadata?.schema.type

  switch (type) {
    case 'option':
    case 'priority':
    case 'resolution':
      return formatOption(value)
    case 'user':
      return formatUser(value)
    case 'array':
      return formatArray(value, metadata?.schema.items)
    case 'string':
    case 'number':
    default:
      return value
  }
}

export function buildCreateIssueFields(input: {
  template: IssueTemplate
  fieldsMetadata: FieldMetadata[]
  userInput: Record<string, unknown>
}): Record<string, unknown> {
  const { template, fieldsMetadata, userInput } = input

  const metadataByFieldId = keyBy(fieldsMetadata, 'fieldId')

  const fields: Record<string, unknown> = {
    project: { key: template.scope.projectKey },
    issuetype: { id: template.scope.issueTypeId }
  }

  // Apply preset fields first
  for (const [fieldId, config] of Object.entries(template.fields)) {
    if (fieldId === 'project' || fieldId === 'issuetype') continue
    if (config.behavior !== 'preset') continue

    const metadata = metadataByFieldId[fieldId]
    fields[fieldId] = formatCreateIssueFieldValue({
      fieldId,
      value: config.presetValue,
      metadata
    })
  }

  // Apply user input last (can override presets)
  for (const [fieldId, value] of Object.entries(userInput)) {
    if (value === undefined) continue

    const metadata = metadataByFieldId[fieldId]
    fields[fieldId] = formatCreateIssueFieldValue({ fieldId, value, metadata })
  }

  return fields
}
