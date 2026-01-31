import { describe, expect, it } from 'vitest'

import {
  buildInitialValues,
  formatValuePreview,
  isEmptyValue,
  pickNonEmptyValues
} from './utils'

describe('CreateIssue utils', () => {
  describe('isEmptyValue', () => {
    it('returns true for undefined and null', () => {
      expect(isEmptyValue(undefined)).toBe(true)
      expect(isEmptyValue(null)).toBe(true)
    })

    it('returns true for empty string', () => {
      expect(isEmptyValue('')).toBe(true)
      expect(isEmptyValue('  ')).toBe(true)
    })

    it('returns true for empty array', () => {
      expect(isEmptyValue([])).toBe(true)
    })

    it('returns true for object with empty id', () => {
      expect(isEmptyValue({ id: '' })).toBe(true)
    })

    it('returns true for object with empty accountId', () => {
      expect(isEmptyValue({ accountId: '' })).toBe(true)
    })

    it('returns false for non-empty string', () => {
      expect(isEmptyValue('test')).toBe(false)
    })

    it('returns false for non-empty array', () => {
      expect(isEmptyValue(['item'])).toBe(false)
    })

    it('returns false for object with non-empty id', () => {
      expect(isEmptyValue({ id: '123' })).toBe(false)
    })
  })

  describe('formatValuePreview', () => {
    it('returns empty string for undefined and null', () => {
      expect(formatValuePreview(undefined)).toBe('')
      expect(formatValuePreview(null)).toBe('')
    })

    it('returns string value as-is', () => {
      expect(formatValuePreview('test')).toBe('test')
    })

    it('converts number to string', () => {
      expect(formatValuePreview(42)).toBe('42')
    })

    it('extracts name from object', () => {
      expect(formatValuePreview({ name: 'Alice' })).toBe('Alice')
    })

    it('extracts value from object if no name', () => {
      expect(formatValuePreview({ value: 'High' })).toBe('High')
    })

    it('extracts displayName from object if no name or value', () => {
      expect(formatValuePreview({ displayName: 'Bob' })).toBe('Bob')
    })

    it('extracts id from object if no other fields', () => {
      expect(formatValuePreview({ id: '123' })).toBe('123')
    })

    it('formats array values with comma separator', () => {
      expect(
        formatValuePreview([
          { name: 'High' },
          { name: 'Medium' },
          { name: 'Low' }
        ])
      ).toBe('High, Medium, Low')
    })

    it('filters empty values from array', () => {
      expect(
        formatValuePreview([{ name: 'High' }, null, { name: 'Low' }])
      ).toBe('High, Low')
    })
  })

  describe('pickNonEmptyValues', () => {
    it('filters out empty values', () => {
      const input = {
        a: 'test',
        b: '',
        c: null,
        d: undefined,
        e: [],
        f: 'valid'
      }

      const result = pickNonEmptyValues(input)

      expect(result).toEqual({
        a: 'test',
        f: 'valid'
      })
    })
  })

  describe('buildInitialValues', () => {
    it('includes summary and description', () => {
      const result = buildInitialValues({
        template: {
          id: '1',
          name: 'Test',
          scope: {
            baseUrlHost: 'test.atlassian.net',
            projectKey: 'TEST',
            issueTypeId: '10001',
            issueTypeName: 'Bug'
          },
          fields: {},
          descriptionTemplate: 'Default description',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z'
        },
        visibleFields: []
      })

      expect(result.summary).toBe('')
      expect(result.description).toBe('Default description')
    })

    it('includes preset values from visible fields', () => {
      const result = buildInitialValues({
        template: {
          id: '1',
          name: 'Test',
          scope: {
            baseUrlHost: 'test.atlassian.net',
            projectKey: 'TEST',
            issueTypeId: '10001',
            issueTypeName: 'Bug'
          },
          fields: {},
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z'
        },
        visibleFields: [
          {
            fieldId: 'priority',
            isEditable: true,
            presetValue: { id: '1', name: 'High' }
          }
        ]
      })

      expect(result.priority).toEqual({ id: '1', name: 'High' })
    })
  })
})
