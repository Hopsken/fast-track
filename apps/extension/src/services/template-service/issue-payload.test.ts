import { describe, expect, it } from 'vitest'

import type { FieldMetadata, IssueTemplate } from '~/types/template'

import { buildCreateIssueFields, toAdfDoc } from './issue-payload'

function createTemplate(partial?: Partial<IssueTemplate>): IssueTemplate {
  const now = new Date().toISOString()
  return {
    id: 't1',
    name: 'Template',
    scope: {
      baseUrlHost: 'example.atlassian.net',
      project: {
        id: '1',
        key: 'PROJ',
        name: 'Project',
        avatarUrl: '',
        issueTypes: [
          {
            id: '10000',
            name: 'Bug',
            iconUrl: '',
            description: '',
            subtask: false
          }
        ]
      },
      issueType: {
        id: '10000',
        name: 'Bug',
        iconUrl: '',
        description: '',
        subtask: false
      }
    },
    fields: {},
    createdAt: now,
    updatedAt: now,
    ...partial
  }
}

describe('toAdfDoc', () => {
  it('wraps plain text into a minimal ADF document', () => {
    expect(toAdfDoc('Hello')).toEqual({
      type: 'doc',
      version: 1,
      content: [
        {
          type: 'paragraph',
          content: [{ type: 'text', text: 'Hello' }]
        }
      ]
    })
  })
})

describe('buildCreateIssueFields', () => {
  const baseFields: FieldMetadata[] = [
    {
      fieldId: 'summary',
      key: 'summary',
      name: 'Summary',
      required: true,
      schema: { type: 'string' }
    },
    {
      fieldId: 'description',
      key: 'description',
      name: 'Description',
      required: false,
      schema: { type: 'string' }
    },
    {
      fieldId: 'priority',
      key: 'priority',
      name: 'Priority',
      required: false,
      schema: { type: 'priority' }
    },
    {
      fieldId: 'components',
      key: 'components',
      name: 'Components',
      required: false,
      schema: { type: 'array', items: 'component' }
    },
    {
      fieldId: 'assignee',
      key: 'assignee',
      name: 'Assignee',
      required: false,
      schema: { type: 'user' }
    }
  ]

  it('merges scope + presets + user input and formats values', () => {
    const template = createTemplate({
      fields: {
        priority: {
          behavior: 'preset',
          presetValue: { id: '1', name: 'High' }
        }
      },
      description: 'Preset description'
    })

    const fields = buildCreateIssueFields({
      template,
      fieldsMetadata: baseFields,
      input: {
        summary: 'Hello',
        // user overrides template description
        description: 'User description',
        components: [
          { id: '10', name: 'Frontend' },
          { id: '11', name: 'Backend' }
        ],
        assignee: { accountId: 'abc123', name: 'Alice' }
      }
    })

    expect(fields).toMatchObject({
      project: { key: 'PROJ' },
      issuetype: { id: '10000' },
      summary: 'Hello',
      description: toAdfDoc('User description'),
      priority: { id: '1' },
      components: [{ id: '10' }, { id: '11' }],
      assignee: { accountId: 'abc123' }
    })
  })

  it('lets userInput override preset fields when both are present', () => {
    const template = createTemplate({
      fields: {
        priority: {
          behavior: 'preset',
          presetValue: { id: '1', name: 'High' }
        }
      }
    })

    const fields = buildCreateIssueFields({
      template,
      fieldsMetadata: baseFields,
      input: {
        summary: 'Hello',
        priority: { id: '2', name: 'Low' }
      }
    })

    expect(fields.priority).toEqual({ id: '2' })
  })
})
