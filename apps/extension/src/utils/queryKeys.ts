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
    keys: (ticketKey: string) => ['tickets', ticketKey] as const,
    detail: (ticketKey: string) => ['tickets', ticketKey, 'detail'] as const,
    search: (params: TicketSearchKey) =>
      [
        'tickets',
        'search',
        {
          ...params,
          projects: normalizeProjects(params.projects)
        }
      ] as const,
    editMeta: (ticketKey: string) =>
      ['tickets', ticketKey, 'editMeta'] as const,
    mergeRequests: (ticketKey: string) =>
      ['tickets', ticketKey, 'mergeRequests'] as const,
    transitions: (ticket: JiraTicket) =>
      ['tickets', ticket.key, 'transitions', ticket.status.name] as const
  }
}
