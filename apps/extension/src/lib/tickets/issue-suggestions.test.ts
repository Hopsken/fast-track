import { describe, expect, it } from 'vitest'

import { JiraTicket } from '@/types'

import { bucketSuggestionTickets } from './issue-suggestions'

const makeTicket = (
  key: string,
  statusCategoryKey: string | null
): JiraTicket => ({
  __typename: 'JiraTicket',
  id: key,
  key,
  summary: `Ticket ${key}`,
  issueType: {
    id: '1',
    name: 'Task',
    iconUrl: '',
    description: ''
  },
  status: {
    id: `status-${key}`,
    name: 'Status',
    description: '',
    statusCategory: {
      key: statusCategoryKey ?? '',
      colorName: '',
      name: ''
    }
  },
  assignee: null,
  priority: null,
  projectKey: 'PROJ',
  boardName: '',
  url: '',
  isInProgress: statusCategoryKey === 'indeterminate',
  sources: [],
  lastViewed: null,
  created: '',
  updated: ''
})

describe('issue suggestion helpers', () => {
  it('buckets tickets into in progress, todo, and done sections', () => {
    const tickets = [
      makeTicket('PROJ-1', 'indeterminate'),
      makeTicket('PROJ-2', 'new'),
      makeTicket('PROJ-3', 'done')
    ]

    expect(bucketSuggestionTickets(tickets)).toEqual({
      inProgress: ['PROJ-1'],
      todo: ['PROJ-2'],
      done: ['PROJ-3']
    })
  })
})
