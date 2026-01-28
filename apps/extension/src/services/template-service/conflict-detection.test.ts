import { describe, expect, it, vi } from 'vitest'

import type { FieldMetadata, IssueTemplate, JsonType } from '~/types/template'

import {
  refreshAndDetectConflicts,
  validatePresetValue
} from './conflict-detection'

function createTemplate(partial?: Partial<IssueTemplate>): IssueTemplate {
  const now = new Date().toISOString()
  return {
    id: 't1',
    name: 'Template',
    trigger: 'tmp',
    scope: {
      siteUrl: 'https://example.atlassian.net',
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

describe('validatePresetValue', () => {
  it('returns true when allowedValues is empty/undefined', () => {
    expect(validatePresetValue('x', undefined, { type: 'string' })).toBe(true)
    expect(validatePresetValue('x', [], { type: 'string' })).toBe(true)
  })

  it('validates option/priority by id', () => {
    const schema: JsonType = { type: 'option' }
    expect(
      validatePresetValue({ id: '1' }, [{ id: '1', name: 'A' }], schema)
    ).toBe(true)
    expect(
      validatePresetValue({ id: 'nope' }, [{ id: '1', name: 'A' }], schema)
    ).toBe(false)
  })

  it('validates array values by id when schema.type=array', () => {
    const schema: JsonType = { type: 'array', items: 'option' }
    expect(
      validatePresetValue(
        [{ id: '1' }, { id: '2' }],
        [{ id: '1' }, { id: '2' }, { id: '3' }],
        schema
      )
    ).toBe(true)

    expect(
      validatePresetValue(
        [{ id: '1' }, { id: 'missing' }],
        [{ id: '1' }],
        schema
      )
    ).toBe(false)
  })

  it('assumes true for user preset validation', () => {
    const schema: JsonType = { type: 'user' }
    expect(validatePresetValue({ accountId: 'x' }, [{ id: '1' }], schema)).toBe(
      true
    )
  })
})

describe('refreshAndDetectConflicts', () => {
  it('detects preset_invalid when preset id not in allowedValues', async () => {
    const template = createTemplate({
      fields: {
        priority: { behavior: 'preset', presetValue: { id: 'deleted' } }
      }
    })

    const jiraService = {
      getCreateIssueFields: vi.fn().mockResolvedValue([
        {
          fieldId: 'priority',
          key: 'priority',
          name: 'Priority',
          required: false,
          schema: { type: 'priority' },
          allowedValues: [{ id: '1' }, { id: '2' }]
        } satisfies FieldMetadata
      ])
    }

    const result = await refreshAndDetectConflicts(template, jiraService as any)

    expect(result.conflicts).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ fieldId: 'priority', type: 'preset_invalid' })
      ])
    )
    expect(result.updatedCache?.fields.length).toBe(1)
  })

  it('detects now_required for newly required fields not configured or ignored', async () => {
    const template = createTemplate({ fields: {} })

    const jiraService = {
      getCreateIssueFields: vi.fn().mockResolvedValue([
        {
          fieldId: 'summary',
          key: 'summary',
          name: 'Summary',
          required: true,
          schema: { type: 'string' }
        },
        {
          fieldId: 'customfield_1',
          key: 'customfield_1',
          name: 'Epic Link',
          required: true,
          schema: { type: 'string' }
        }
      ])
    }

    const result = await refreshAndDetectConflicts(template, jiraService as any)

    expect(result.conflicts).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          fieldId: 'customfield_1',
          type: 'now_required'
        })
      ])
    )
  })

  it('detects field_removed when configured field no longer exists (non-ignore)', async () => {
    const template = createTemplate({
      fields: { customfield_2: { behavior: 'visible' } }
    })

    const jiraService = {
      getCreateIssueFields: vi.fn().mockResolvedValue([
        {
          fieldId: 'summary',
          key: 'summary',
          name: 'Summary',
          required: true,
          schema: { type: 'string' }
        }
      ])
    }

    const result = await refreshAndDetectConflicts(template, jiraService as any)

    expect(result.conflicts).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          fieldId: 'customfield_2',
          type: 'field_removed'
        })
      ])
    )
  })

  it('returns scope_invalid conflict and null cache when jira service throws 404-like error', async () => {
    const template = createTemplate({ fields: {} })

    const jiraService = {
      getCreateIssueFields: vi.fn().mockRejectedValue({ status: 404 })
    }

    const result = await refreshAndDetectConflicts(template, jiraService as any)

    expect(result.updatedCache).toBeNull()
    expect(result.conflicts).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ type: 'scope_invalid' })
      ])
    )
  })
})
