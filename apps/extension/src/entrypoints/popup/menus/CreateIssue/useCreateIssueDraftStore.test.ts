import { describe, expect, it } from 'vitest'

import type { VisibleField } from '~/services/template-service/gap-analysis'
import type { IssueTemplate } from '~/types/template'

import { createIssueDraftStore } from './useCreateIssueDraftStore'

const template: IssueTemplate = {
  id: 'tpl-1',
  name: 'Template',
  scope: {
    baseUrlHost: 'example.atlassian.net',
    project: {
      id: '10000',
      key: 'PROJ',
      name: 'Project'
    },
    issueType: {
      id: '10001',
      name: 'Task',
      iconUrl: 'https://example.com/task.svg',
      description: 'Task issue type'
    }
  },
  fields: [],
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z'
}

function createVisibleField(fieldId: string): VisibleField {
  return {
    fieldId,
    isEditable: true,
    metadata: {
      fieldId,
      key: fieldId,
      name: fieldId,
      required: false,
      schema: {
        type: 'string'
      }
    }
  }
}

describe('createIssueDraftStore', () => {
  it('keeps the last visited field highlighted after returning to review menu', () => {
    const store = createIssueDraftStore(template.scope, template)

    const wizardFields = [
      createVisibleField('summary'),
      createVisibleField('priority')
    ]

    store.getState().setWizardFields(wizardFields)
    store.getState().setWizardIndex(1)
    store.getState().setWizardIndex(-1)

    expect(store.getState().lastVisitedFieldId).toBe('priority')
  })

  it('clears last visited field when field list no longer contains it', () => {
    const store = createIssueDraftStore(template.scope, template)

    store
      .getState()
      .setWizardFields([
        createVisibleField('summary'),
        createVisibleField('priority')
      ])
    store.getState().setWizardIndex(1)

    store.getState().setWizardFields([createVisibleField('summary')])

    expect(store.getState().lastVisitedFieldId).toBeNull()
  })
})
