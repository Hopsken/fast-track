import type { PageOfCreateMetaIssueTypeWithField } from 'jira.js/version3/models/pageOfCreateMetaIssueTypeWithField'
import { describe, expect, it } from 'vitest'

import { isValidCreateMetaFields, parseCreateMetaFields } from './create-meta'

describe('ticket-service create-meta parsing', () => {
  it('returns empty for empty fields', () => {
    const input = { fields: [] } as PageOfCreateMetaIssueTypeWithField
    const fields = parseCreateMetaFields(input)
    expect(fields).toEqual([])
    expect(isValidCreateMetaFields(fields)).toBe(false)
  })

  it('maps fields record to FieldMetadata[]', () => {
    const input = {
      fields: [
        {
          fieldId: 'summary',
          key: 'summary',
          name: 'Summary',
          required: true,
          schema: { type: 'string' }
        }
      ]
    } as unknown as PageOfCreateMetaIssueTypeWithField

    const fields = parseCreateMetaFields(input)
    expect(fields).toHaveLength(1)
    expect(fields[0]?.fieldId).toBe('summary')
    expect(fields[0]?.schema.type).toBe('string')
    expect(isValidCreateMetaFields(fields)).toBe(true)
  })

  it('skips fields without schema.type', () => {
    const input = {
      fields: [
        {
          fieldId: 'foo',
          key: 'foo',
          name: 'Foo',
          required: false,
          schema: {}
        }
      ]
    } as unknown as PageOfCreateMetaIssueTypeWithField

    const fields = parseCreateMetaFields(input)
    expect(fields).toEqual([])
  })
})
