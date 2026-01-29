import { describe, expect, it } from 'vitest'

import type {
  CachedFieldMetadata,
  FieldConflict,
  FieldMetadata,
  IssueTemplate
} from '~/types/template'

import { computeVisibleFields } from './gap-analysis'

function createTemplate(partial?: Partial<IssueTemplate>): IssueTemplate {
  const now = new Date().toISOString()
  return {
    id: 't1',
    name: 'Template',
    scope: {
      baseUrlHost: 'example.atlassian.net',
      projectKey: 'PROJ',
      issueTypeId: '10000',
      issueTypeName: 'Bug'
    },
    fields: {},
    createdAt: now,
    updatedAt: now,
    ...partial
  }
}

function cache(fields: FieldMetadata[]): CachedFieldMetadata {
  return {
    cacheKey: 'k',
    lastUpdated: new Date().toISOString(),
    fields
  }
}

const summaryField: FieldMetadata = {
  fieldId: 'summary',
  key: 'summary',
  name: 'Summary',
  required: true,
  schema: { type: 'string' }
}

const priorityField: FieldMetadata = {
  fieldId: 'priority',
  key: 'priority',
  name: 'Priority',
  required: false,
  schema: { type: 'priority' },
  allowedValues: [{ id: '1', name: 'High' }]
}

describe('computeVisibleFields', () => {
  it('always includes summary', () => {
    const template = createTemplate({ fields: {} })
    const visible = computeVisibleFields(template, cache([summaryField]), [])

    expect(visible.some((f) => f.fieldId === 'summary')).toBe(true)
  })

  it('includes description if behavior=visible', () => {
    const template = createTemplate({
      fields: { description: { behavior: 'visible' } }
    })

    const visible = computeVisibleFields(template, undefined, [])

    expect(visible.some((f) => f.fieldId === 'description')).toBe(true)
  })

  it('includes description if descriptionTemplate exists', () => {
    const template = createTemplate({ descriptionTemplate: 'Hello' })

    const visible = computeVisibleFields(template, undefined, [])

    expect(visible.some((f) => f.fieldId === 'description')).toBe(true)
  })

  it('shows fields with behavior=visible', () => {
    const template = createTemplate({
      fields: { priority: { behavior: 'visible' } }
    })

    const visible = computeVisibleFields(
      template,
      cache([summaryField, priorityField]),
      []
    )

    expect(visible).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ fieldId: 'priority', isEditable: true })
      ])
    )
  })

  it('hides preset fields when no conflict', () => {
    const template = createTemplate({
      fields: { priority: { behavior: 'preset', presetValue: { id: '1' } } }
    })

    const visible = computeVisibleFields(
      template,
      cache([summaryField, priorityField]),
      []
    )

    expect(visible.some((f) => f.fieldId === 'priority')).toBe(false)
  })

  it('shows preset fields when conflict exists for that field', () => {
    const template = createTemplate({
      fields: {
        priority: { behavior: 'preset', presetValue: { id: 'deleted' } }
      }
    })

    const conflicts: FieldConflict[] = [
      {
        fieldId: 'priority',
        fieldName: 'Priority',
        type: 'preset_invalid',
        message: 'Preset invalid',
        fieldMetadata: priorityField
      }
    ]

    const visible = computeVisibleFields(
      template,
      cache([summaryField, priorityField]),
      conflicts
    )

    expect(visible).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          fieldId: 'priority',
          conflict: expect.objectContaining({ type: 'preset_invalid' })
        })
      ])
    )
  })

  it('adds now_required conflicts even if not in template', () => {
    const template = createTemplate({ fields: {} })

    const conflicts: FieldConflict[] = [
      {
        fieldId: 'customfield_1',
        fieldName: 'Epic Link',
        type: 'now_required',
        message: 'Now required',
        fieldMetadata: {
          fieldId: 'customfield_1',
          key: 'customfield_1',
          name: 'Epic Link',
          required: true,
          schema: { type: 'string' }
        }
      }
    ]

    const visible = computeVisibleFields(template, undefined, conflicts)

    expect(visible).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          fieldId: 'customfield_1',
          conflict: expect.objectContaining({ type: 'now_required' })
        })
      ])
    )
  })

  it('ignores project/issuetype fields', () => {
    const template = createTemplate({
      fields: {
        project: { behavior: 'visible' },
        issuetype: { behavior: 'visible' }
      }
    })

    const visible = computeVisibleFields(template, undefined, [])

    expect(visible.some((f) => f.fieldId === 'project')).toBe(false)
    expect(visible.some((f) => f.fieldId === 'issuetype')).toBe(false)
  })
})
