import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import type { VisibleField } from '~/services/template-service/gap-analysis'

import { buildInitialValues, computeWizardSequence } from './utils'

describe('computeWizardSequence', () => {
  it('excludes summary (edited in hub) and includes description as a normal optional field', () => {
    const fields: VisibleField[] = [
      {
        fieldId: 'summary',
        isEditable: true,
        metadata: {
          fieldId: 'summary',
          key: 'summary',
          name: 'Summary',
          required: true,
          hasDefaultValue: false,
          schema: { type: 'string', system: 'summary' }
        }
      },
      {
        fieldId: 'description',
        isEditable: true,
        metadata: {
          fieldId: 'description',
          key: 'description',
          name: 'Description',
          required: false,
          hasDefaultValue: false,
          schema: { type: 'string', system: 'description' }
        }
      },
      {
        fieldId: 'labels',
        isEditable: true,
        metadata: {
          fieldId: 'labels',
          key: 'labels',
          name: 'Labels',
          required: false,
          hasDefaultValue: false,
          schema: { type: 'array', items: 'string', system: 'labels' }
        }
      },
      {
        fieldId: 'reporter',
        isEditable: true,
        metadata: {
          fieldId: 'reporter',
          key: 'reporter',
          name: 'Reporter',
          required: true,
          hasDefaultValue: false,
          schema: { type: 'user', system: 'reporter' }
        }
      }
    ]

    const seq = computeWizardSequence(fields).map((f) => f.fieldId)
    expect(seq).toEqual(['reporter', 'description', 'labels'])
  })
})

describe('buildInitialValues (TU-56 preset key temporal resolution)', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-01T00:00:00.000Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('resolves @tomorrow preset key into ISO date at draft init', () => {
    const fields: VisibleField[] = [
      {
        fieldId: 'customfield_date',
        isEditable: true,
        metadata: {
          fieldId: 'customfield_date',
          key: 'customfield_date',
          name: 'Target date',
          required: false,
          hasDefaultValue: false,
          schema: { type: 'date' }
        },
        config: {
          fieldId: 'customfield_date',
          behavior: 'preset',
          presetValue: '@tomorrow'
        }
      }
    ]

    const values = buildInitialValues(fields)
    expect(values.customfield_date).toBe('2026-01-02')
  })

  it('resolves @tomorrow preset key into ISO datetime at draft init', () => {
    const fields: VisibleField[] = [
      {
        fieldId: 'customfield_datetime',
        isEditable: true,
        metadata: {
          fieldId: 'customfield_datetime',
          key: 'customfield_datetime',
          name: 'Start time',
          required: false,
          hasDefaultValue: false,
          schema: { type: 'datetime' }
        },
        config: {
          fieldId: 'customfield_datetime',
          behavior: 'preset',
          presetValue: '@tomorrow'
        }
      }
    ]

    const values = buildInitialValues(fields)
    expect(String(values.customfield_datetime)).toMatch(
      /^2026-01-02T09:00:00\.000[+-]\d\d:\d\d$/
    )
  })

  it('passes through absolute ISO date literal as-is', () => {
    const fields: VisibleField[] = [
      {
        fieldId: 'customfield_date',
        isEditable: true,
        metadata: {
          fieldId: 'customfield_date',
          key: 'customfield_date',
          name: 'Target date',
          required: false,
          hasDefaultValue: false,
          schema: { type: 'date' }
        },
        config: {
          fieldId: 'customfield_date',
          behavior: 'preset',
          presetValue: '2026-03-15'
        }
      }
    ]

    const values = buildInitialValues(fields)
    expect(values.customfield_date).toBe('2026-03-15')
  })

  it('leaves unknown preset key in values unchanged (fallback)', () => {
    const fields: VisibleField[] = [
      {
        fieldId: 'customfield_date',
        isEditable: true,
        metadata: {
          fieldId: 'customfield_date',
          key: 'customfield_date',
          name: 'Target date',
          required: false,
          hasDefaultValue: false,
          schema: { type: 'date' }
        },
        config: {
          fieldId: 'customfield_date',
          behavior: 'preset',
          presetValue: '@unknown_key'
        }
      }
    ]

    const values = buildInitialValues(fields)
    expect(values.customfield_date).toBe('@unknown_key')
  })
})
