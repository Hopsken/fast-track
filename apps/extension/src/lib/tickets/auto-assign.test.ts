import { describe, expect, it } from 'vitest'

import { shouldAutoAssignOnTransition } from '@/lib/tickets/auto-assign'
import { JiraTicket, JiraTransition, UserPreferences } from '@/types'

const basePreferences: UserPreferences = {
  branchNameFormat: '{key}-{summary}',
  autoCopyBranchNameOnTransition: false,
  autoAssignOnInProgress: true
}

const baseTicket = {
  id: '1',
  key: 'JIRA-1',
  summary: 'Test',
  issueType: { name: 'Story', iconUrl: '', description: '' },
  status: {
    id: '10',
    name: 'To Do',
    description: '',
    statusCategory: { key: 'new', colorName: 'blue', name: 'To Do' }
  },
  assignee: null,
  priority: null,
  projectKey: 'JIRA',
  boardName: 'Board',
  url: 'https://jira.example.com',
  isInProgress: false,
  sources: [],
  lastViewed: null,
  created: '2024-01-01',
  updated: '2024-01-01'
} satisfies JiraTicket

const baseTransition = {
  id: '20',
  name: 'Start Progress',
  to: {
    id: '30',
    name: 'In Progress',
    description: '',
    statusCategory: {
      key: 'indeterminate',
      colorName: 'yellow',
      name: 'In Progress'
    }
  }
} satisfies JiraTransition

describe('shouldAutoAssignOnTransition', () => {
  it('returns true for unassigned To Do -> In Progress when preference enabled', () => {
    expect(
      shouldAutoAssignOnTransition(basePreferences, baseTicket, baseTransition)
    ).toBe(true)
  })

  it('returns false when preference is disabled', () => {
    expect(
      shouldAutoAssignOnTransition(
        { ...basePreferences, autoAssignOnInProgress: false },
        baseTicket,
        baseTransition
      )
    ).toBe(false)
  })

  it('returns false when ticket already has an assignee', () => {
    expect(
      shouldAutoAssignOnTransition(
        basePreferences,
        {
          ...baseTicket,
          assignee: {
            displayName: 'Jane',
            emailAddress: '',
            avatarUrls: ''
          }
        },
        baseTransition
      )
    ).toBe(false)
  })
})
