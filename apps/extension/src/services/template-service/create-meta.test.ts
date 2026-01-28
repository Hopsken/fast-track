import { describe, expect, it } from 'vitest'

import type { FieldMetadata } from '~/types/template'

import { isValidCreateMetaFields, parseCreateMetaFields } from './create-meta'

describe('create-meta parsing', () => {
  const field: FieldMetadata = {
    fieldId: 'summary',
    key: 'summary',
    name: 'Summary',
    required: true,
    schema: { type: 'string' }
  }

  it('parses array responses', () => {
    const fields = parseCreateMetaFields([field])
    expect(fields).toHaveLength(1)
    expect(isValidCreateMetaFields(fields)).toBe(true)
  })

  it('parses object responses with fields', () => {
    const fields = parseCreateMetaFields({ fields: [field] })
    expect(fields).toHaveLength(1)
    expect(isValidCreateMetaFields(fields)).toBe(true)
  })

  it('returns empty for unknown shapes', () => {
    const fields = parseCreateMetaFields({ nope: true })
    expect(fields).toEqual([])
    expect(isValidCreateMetaFields(fields)).toBe(false)
  })
})
