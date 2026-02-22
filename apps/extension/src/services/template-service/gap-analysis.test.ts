import { describe, expect, it } from 'vitest'

import { JiraFieldMetadata } from '@/repository/schema'
import type { FieldConflict, IssueTemplate } from '~/types/template'

import { computeVisibleFields } from './gap-analysis'

function createTemplate(partial?: Partial<IssueTemplate>): IssueTemplate {
  const now = new Date().toISOString()
  return {
    id: 't1',
    name: 'Template',
    scope: {
      baseUrlHost: 'example.atlassian.net',
      project: {
        id: 'p1',
        key: 'PROJ',
        name: 'Project'
      },
      issueType: {
        id: '10000',
        name: 'Bug',
        iconUrl: '',
        description: ''
      }
    },
    fields: [],
    createdAt: now,
    updatedAt: now,
    ...partial
  }
}

const summaryField: JiraFieldMetadata = {
  fieldId: 'summary',
  key: 'summary',
  name: 'Summary',
  required: true,
  schema: { type: 'string' }
}

const descriptionField: JiraFieldMetadata = {
  fieldId: 'description',
  key: 'description',
  name: 'Description',
  required: false,
  schema: { type: 'string' }
}

const priorityField: JiraFieldMetadata = {
  fieldId: 'priority',
  key: 'priority',
  name: 'Priority',
  required: false,
  schema: { type: 'priority' },
  allowedValues: [{ id: '1', name: 'High' }]
}

describe('computeVisibleFields', () => {
  it('always includes summary', () => {
    const template = createTemplate({ fields: [] })
    const visible = computeVisibleFields(template, [summaryField], [])

    expect(visible.some((f) => f.fieldId === 'summary')).toBe(true)
  })

  it('includes description if behavior=preset (when metadata is available)', () => {
    const template = createTemplate({
      fields: [
        {
          fieldId: 'description',
          behavior: 'preset',
          presetValue: 'Hello'
        }
      ]
    })

    const visible = computeVisibleFields(
      template,
      [summaryField, descriptionField],
      []
    )

    expect(visible.some((f) => f.fieldId === 'description')).toBe(true)
  })

  it('does not treat template.description as the Jira description field', () => {
    const template = createTemplate({ description: 'Hello' })

    const visible = computeVisibleFields(
      template,
      [summaryField, descriptionField],
      []
    )

    expect(visible.some((f) => f.fieldId === 'description')).toBe(false)
  })

  it('shows fields with behavior=preset', () => {
    const template = createTemplate({
      fields: [
        {
          fieldId: 'priority',
          behavior: 'preset',
          presetValue: { id: '1' }
        }
      ]
    })

    const visible = computeVisibleFields(
      template,
      [summaryField, priorityField],
      []
    )

    expect(visible).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ fieldId: 'priority', isEditable: true })
      ])
    )
  })

  it('shows preset fields when conflict exists for that field', () => {
    const template = createTemplate({
      fields: [
        {
          fieldId: 'priority',
          behavior: 'preset',
          presetValue: { id: 'deleted' }
        }
      ]
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
      [summaryField, priorityField],
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
    const template = createTemplate({ fields: [] })

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

    const visible = computeVisibleFields(template, [], conflicts)

    expect(visible).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          fieldId: 'customfield_1',
          conflict: expect.objectContaining({ type: 'now_required' })
        })
      ])
    )
  })

  it('surfaces unconfigured required fields from cache as visible', () => {
    const requiredCustomField: JiraFieldMetadata = {
      fieldId: 'customfield_9',
      key: 'customfield_9',
      name: 'Team',
      required: true,
      schema: { type: 'string' }
    }
    const template = createTemplate({ fields: [] })

    const visible = computeVisibleFields(
      template,
      [summaryField, priorityField, requiredCustomField],
      []
    )

    // summary is always shown; the required custom field should appear too
    expect(visible.some((f) => f.fieldId === 'customfield_9')).toBe(true)
    expect(visible.find((f) => f.fieldId === 'customfield_9')).toMatchObject({
      fieldId: 'customfield_9',
      metadata: requiredCustomField,
      isEditable: true
    })
    // optional priority should NOT surface
    expect(visible.some((f) => f.fieldId === 'priority')).toBe(false)
  })

  it('does not duplicate required fields already configured in template', () => {
    const requiredField: JiraFieldMetadata = {
      fieldId: 'priority',
      key: 'priority',
      name: 'Priority',
      required: true,
      schema: { type: 'priority' },
      allowedValues: [{ id: '1', name: 'High' }]
    }
    const template = createTemplate({
      fields: [
        {
          fieldId: 'priority',
          behavior: 'preset',
          presetValue: { id: '1' }
        }
      ]
    })

    const visible = computeVisibleFields(
      template,
      [summaryField, requiredField],
      []
    )

    expect(visible.filter((f) => f.fieldId === 'priority')).toHaveLength(1)
  })

  it('does not duplicate required fields already visible via template config', () => {
    const requiredField: JiraFieldMetadata = {
      fieldId: 'customfield_9',
      key: 'customfield_9',
      name: 'Team',
      required: true,
      schema: { type: 'string' }
    }
    const template = createTemplate({
      fields: [
        {
          fieldId: 'customfield_9',
          behavior: 'preset',
          presetValue: { id: '1' }
        }
      ]
    })

    const visible = computeVisibleFields(
      template,
      [summaryField, requiredField],
      []
    )

    // Should appear exactly once (from template config), not duplicated
    expect(visible.filter((f) => f.fieldId === 'customfield_9')).toHaveLength(1)
  })

  it('shows restricted fields with conflict and uses conflict metadata', () => {
    const template = createTemplate({
      fields: [
        {
          fieldId: 'priority',
          behavior: 'restricted',
          allowedOptions: [
            { id: '1', name: 'High' },
            { id: 'gone', name: 'Removed' }
          ]
        }
      ]
    })

    const freshMeta: JiraFieldMetadata = {
      fieldId: 'priority',
      key: 'priority',
      name: 'Priority',
      required: false,
      schema: { type: 'priority' },
      allowedValues: [{ id: '1', name: 'High' }]
    }

    const conflicts: FieldConflict[] = [
      {
        fieldId: 'priority',
        fieldName: 'Priority',
        type: 'restricted_option_invalid',
        message: 'Some restricted options no longer exist',
        fieldMetadata: freshMeta
      }
    ]

    const visible = computeVisibleFields(
      template,
      [summaryField, priorityField],
      conflicts
    )

    const field = visible.find((f) => f.fieldId === 'priority')
    expect(field).toMatchObject({
      fieldId: 'priority',
      metadata: freshMeta,
      isEditable: true,
      conflict: expect.objectContaining({ type: 'restricted_option_invalid' })
    })
  })

  it('does not duplicate required fields already restricted', () => {
    const requiredPriority: JiraFieldMetadata = {
      ...priorityField,
      required: true
    }
    const template = createTemplate({
      fields: [
        {
          fieldId: 'priority',
          behavior: 'restricted',
          allowedOptions: [{ id: '1', name: 'High' }]
        }
      ]
    })

    const visible = computeVisibleFields(
      template,
      [summaryField, requiredPriority],
      []
    )

    expect(visible.filter((f) => f.fieldId === 'priority')).toHaveLength(1)
  })

  it('ignores project/issuetype fields', () => {
    const template = createTemplate({
      fields: [
        {
          fieldId: 'project',
          behavior: 'preset',
          presetValue: { id: '1' }
        },
        {
          fieldId: 'issuetype',
          behavior: 'preset',
          presetValue: { id: '1' }
        }
      ]
    })

    const visible = computeVisibleFields(template, [], [])

    expect(visible.some((f) => f.fieldId === 'project')).toBe(false)
    expect(visible.some((f) => f.fieldId === 'issuetype')).toBe(false)
  })
})
