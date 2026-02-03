import { keyBy } from 'lodash-es'

import type {
  AllowedValue,
  FieldMetadata,
  IssueTemplate,
  JiraSchemaItemType
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

function formatIssue(value: unknown): null | { key: string } {
  if (!value) return null

  const rec = asRecord(value)
  if (rec && typeof rec.key === 'string') {
    return { key: rec.key }
  }

  return null
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

function formatArray(
  value: unknown,
  items: JiraSchemaItemType | undefined
): unknown {
  if (!Array.isArray(value)) return value

  // Collection types and option-like types - extract ID only
  if (
    items === 'option' ||
    items === 'component' ||
    items === 'version' ||
    items === 'priority' ||
    items === 'resolution' ||
    items === 'group'
  ) {
    return value.map((v) => formatOption(v))
  }

  // User arrays - extract accountId only
  if (items === 'user') {
    return value.map((v) => formatUser(v))
  }

  // Labels and other string arrays
  if (items === 'string') {
    return value
  }

  // Issue links array
  if (items === 'issuelinks') {
    return value.map((v) => {
      const rec = asRecord(v)
      if (!rec) return v

      const typeObj = asRecord(rec.type)
      const outwardIssue = asRecord(rec.outwardIssue)

      if (!typeObj) return v

      return {
        type: { id: typeObj.id },
        outwardIssue: outwardIssue ? { key: outwardIssue.key } : undefined
      }
    })
  }

  return value
}

export function formatCreateIssueFieldValue(input: {
  fieldId: string
  value: unknown
  metadata?: FieldMetadata
}): unknown {
  const { fieldId, value, metadata } = input

  // Description field - convert to ADF
  if (fieldId === 'description') {
    if (typeof value === 'string' && value.trim().length > 0) {
      return toAdfDoc(value)
    }
    return value
  }

  const type = metadata?.schema.type
  const items = metadata?.schema.items
  const custom = metadata?.schema.custom

  // well known custom fields
  if (custom === 'com.pyxis.greenhopper.jira:gh-sprint' && value) {
    return asRecord(value)?.id
  }

  switch (type) {
    // Visual entity types - extract ID only
    case 'option':
    case 'priority':
    case 'resolution':
    case 'issuetype':
    case 'project':
    case 'status':
    case 'securitylevel':
      return formatOption(value)

    // User type - extract accountId only
    case 'user':
      return formatUser(value)

    // Array types - format based on items type
    case 'array':
      return formatArray(value, items)

    // Date type - pass through (already in YYYY-MM-DD format)
    case 'date':
      return value

    // DateTime type - should already be in ISO 8601 format from DateTimeInput
    case 'datetime':
      return value

    // Time tracking - pass through (Jira accepts "2w 3d 4h" format)
    case 'timetracking':
      return value

    // Issue link - format for Jira API
    case 'issuelink': {
      const rec = asRecord(value)
      if (!rec) return value

      const issue = formatIssue(value)
      if (issue) return issue

      const typeObj = asRecord(rec.type)
      const outwardIssue = asRecord(rec.outwardIssue)

      if (!typeObj) return value

      return {
        type: { id: typeObj.id },
        outwardIssue: outwardIssue ? { key: outwardIssue.key } : undefined
      }
    }

    // Basic scalar types
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
    project: { key: template.scope.project.key },
    issuetype: { id: template.scope.issueType.id }
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
