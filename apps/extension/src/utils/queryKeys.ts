import { JiraTicket } from '@/types'

export const queryKeys = {
  issue: {
    editMeta: (issue: JiraTicket) => ['issue', issue.key, 'editMeta']
  }
}
