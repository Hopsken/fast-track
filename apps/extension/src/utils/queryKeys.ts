import { JiraTicket } from '@/types'
import { normalizeProjects } from '@/utils/ticket-search'

export type TicketSearchKey = {
  query: string
  projects: string[]
  limit: number
}

export const queryKeys = {
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
      ] as const,
    editMeta: (ticket: JiraTicket) =>
      ['tickets', ticket.key, 'editMeta'] as const,
    mergeRequests: (ticket: JiraTicket) =>
      ['tickets', ticket.key, 'mergeRequests'] as const,
    transitions: (ticket: JiraTicket) =>
      ['tickets', ticket.key, 'transitions', ticket.status.name] as const
  }
}
