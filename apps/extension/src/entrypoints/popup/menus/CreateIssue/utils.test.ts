import { describe, expect, it } from 'vitest'

import type { VisibleField } from '~/services/template-service/gap-analysis'

import { computeWizardSequence } from './utils'

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
