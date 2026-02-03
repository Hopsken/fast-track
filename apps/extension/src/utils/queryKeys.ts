import { JiraTicket } from '@/types'
import { normalizeProjects } from '@/utils/ticket-search'

export type TicketSearchKey = {
  query: string
  projects: string[]
  limit: number
}

export const queryKeys = {
  labels: ['labels'],
  autoComplete: (url: string, query: string) => ['autoComplete', url, query],
  priorities: ['priorities'],
  users: {
    search: (projectKey: string, query: string) =>
      ['users', 'search', projectKey, query] as const
  },
  agile: {
    projectSprints: (projectKeyOrId: string) =>
      ['agile', 'sprints', projectKeyOrId] as const
  },
  projects: {
    frequent: ['projects', 'frequent'] as const,
    recent: ['projects', 'recent'] as const,
    search: (query: string) => ['projects', 'search', query] as const,
    /**
     * Unified key used when the data source depends on whether query is empty:
     * - empty query => recent projects
     * - non-empty query => search projects
     */
    recentOrSearch: (query: string) =>
      ['projects', 'recentOrSearch', query] as const,
    issueTypes: (projectKey: string) =>
      ['projects', 'issueTypes', projectKey] as const
  },
  issues: {
    createMeta: (projectKey: string, issueTypeId: string) =>
      ['issues/meta', projectKey, issueTypeId] as const
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
      ['tickets', ticket.key, 'transitions', ticket.status.name] as const,
    createMeta: (projectId: string, issueTypeId: string) =>
      ['tickets', 'createMeta', projectId, issueTypeId] as const
  },
  issueTemplates: {
    list: (showAll: boolean) => {
      return ['issueTemplates', 'list', showAll] as const
    }
  }
}
