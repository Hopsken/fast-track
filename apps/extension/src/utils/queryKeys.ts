import { JiraTicket } from '@/types'

export const queryKeys = {
  issue: {
    editMeta: (issue: JiraTicket) => ['issue', issue.key, 'editMeta'],
    transitions: (issue: JiraTicket) => ['issue', issue.key, 'transitions']
  },
  autoComplete: (url: string, query: string) => ['autoComplete', url, query],
  priorities: ['priorities']
}
