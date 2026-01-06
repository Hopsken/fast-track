import { JiraTicket } from '@/types'
import { normalizeProjects } from '@/utils/ticket-search'

export type TicketSearchKey = {
  query: string
  projects: string[]
  limit: number
}

export const queryKeys = {
  issue: {
    editMeta: (issue: JiraTicket) => ['issue', issue.key, 'editMeta'],
    transitions: (issue: JiraTicket) => [
      'issue',
      issue.key,
      'transitions',
      issue.status.name
    ]
  },
  autoComplete: (url: string, query: string) => ['autoComplete', url, query],
  priorities: ['priorities'],
  projects: {
    frequent: ['projects', 'frequent'] as const
  },
  tickets: {
    suggestions: ['tickets', 'suggestions'] as const,
    detail: (issueKey: string) => ['tickets', 'detail', issueKey] as const,
    search: (params: TicketSearchKey) =>
      [
        'tickets',
        'search',
        {
          ...params,
          projects: normalizeProjects(params.projects)
        }
      ] as const
  }
}
