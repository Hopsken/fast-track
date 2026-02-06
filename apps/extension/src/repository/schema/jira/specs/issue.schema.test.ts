import { describe, expect, it } from 'vitest'

import { JiraIssueSchema } from '../issue'

const baseTicket = {
  __typename: 'JiraTicket',
  id: '1',
  key: 'PROJ-1',
  summary: 'Test ticket',
  issueType: {
    id: '10001',
    name: 'Task',
    iconUrl: 'https://jira.example.com/task.svg',
    description: ''
  },
  status: {
    id: '20001',
    name: 'To Do',
    description: '',
    statusCategory: {
      key: 'new',
      colorName: 'blue',
      name: 'To Do'
    }
  },
  assignee: {
    displayName: 'Alex Doe',
    emailAddress: 'alex@example.com',
    avatarUrls: 'https://jira.example.com/avatar.png'
  },
  priority: {
    id: '30001',
    name: 'High',
    iconUrl: 'https://jira.example.com/high.svg'
  },
  projectKey: 'PROJ',
  boardName: 'Main Board',
  url: 'https://jira.example.com/browse/PROJ-1',
  isInProgress: false,
  sources: ['history'],
  lastViewed: null,
  created: '2024-01-01T00:00:00Z',
  updated: '2024-01-02T00:00:00Z'
}

describe('jira issue schemas', () => {
  it('parses a JiraIssue payload', () => {
    expect(() => JiraIssueSchema.parse(baseTicket)).not.toThrow()
  })

  it('normalizes avatarUrls from record to string', () => {
    const withRecordAvatar = {
      ...baseTicket,
      assignee: {
        ...baseTicket.assignee,
        avatarUrls: {
          '24x24': 'https://jira.example.com/avatar-24.png',
          '48x48': 'https://jira.example.com/avatar-48.png'
        }
      }
    }

    const parsed = JiraIssueSchema.parse(withRecordAvatar)
    expect(parsed.assignee?.avatarUrls).toBe(
      'https://jira.example.com/avatar-48.png'
    )
  })
})
