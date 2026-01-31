import { describe, expect, it } from 'vitest'

import type {
  CachedFieldMetadata,
  FieldMetadata,
  IssueTemplate
} from '~/types/template'

import { buildCreateIssueFields, toAdfDoc } from './issue-payload'

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
  const baseCache = cache([
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
  ])

  it('merges scope + presets + user input and formats values', () => {
    const template = createTemplate({
      fields: {
        priority: {
          behavior: 'preset',
          presetValue: { id: '1', name: 'High' }
        }
      },
      descriptionTemplate: 'Preset description'
    })

    const fields = buildCreateIssueFields({
      template,
      cache: baseCache,
      userInput: {
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

  it('uses descriptionTemplate when userInput.description is not provided', () => {
    const template = createTemplate({
      descriptionTemplate: 'Preset description'
    })

    const fields = buildCreateIssueFields({
      template,
      cache: baseCache,
      userInput: {
        summary: 'Hello'
      }
    })

    expect(fields.description).toEqual(toAdfDoc('Preset description'))
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
      cache: baseCache,
      userInput: {
        summary: 'Hello',
        priority: { id: '2', name: 'Low' }
      }
    })

    expect(fields.priority).toEqual({ id: '2' })
  })
})
