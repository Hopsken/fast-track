import { describe, expect, it } from 'vitest'

import { JiraTicket } from '@/types'

import {
  buildRecommendKeys,
  bucketSuggestionTickets,
  filterSuggestionTickets
} from './issue-suggestions'

const makeTicket = (
  key: string,
  statusCategoryKey: string | null
): JiraTicket => ({
  id: key,
  key,
  summary: `Ticket ${key}`,
  issueType: {
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
  it('filters tickets to in progress, todo, and done status categories', () => {
    const tickets = [
      makeTicket('PROJ-1', 'indeterminate'),
      makeTicket('PROJ-2', 'new'),
      makeTicket('PROJ-3', 'done'),
      makeTicket('PROJ-4', 'backlog')
    ]

    expect(
      filterSuggestionTickets(tickets).map((ticket) => ticket.key)
    ).toEqual(['PROJ-1', 'PROJ-2', 'PROJ-3'])
  })

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

  it('builds recommend keys from history excluding primary buckets', () => {
    const history = [
      makeTicket('PROJ-1', 'indeterminate'),
      makeTicket('PROJ-2', 'new'),
      makeTicket('PROJ-3', 'done'),
      makeTicket('PROJ-4', 'done')
    ]

    const excluded = ['PROJ-1', 'PROJ-2']

    expect(buildRecommendKeys(history, excluded)).toEqual(['PROJ-3', 'PROJ-4'])
  })
})
