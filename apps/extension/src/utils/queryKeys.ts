import { JiraTicket } from '@/types'

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
  tickets: {
    suggestions: ['tickets', 'suggestions'] as const,
    search: (query: string) => ['tickets', 'search', query] as const
  }
}
