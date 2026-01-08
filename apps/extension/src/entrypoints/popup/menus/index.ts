import { JiraMergeRequest, JiraTicket } from '@/types'

export type CommandRoutes = {
  '/': void
  '/actions': JiraTicket
  '/ticket/merge-requests': {
    mergeRequests: JiraMergeRequest[]
    ticket: JiraTicket
  }
  '/ticket/assign': JiraTicket
  '/ticket/status': JiraTicket
  '/ticket/priority': JiraTicket
  '/ticket/details': JiraTicket
}

export { SearchResultMenu } from './SearchResultMenu'
export { TicketActionsMenu } from './TicketActionsMenu'
export { TicketAssignMenu } from './TicketAssignMenu'
export { TicketStatusMenu } from './TicketStatusMenu'
export { TicketPriorityMenu } from './TicketPriorityMenu'
export { TicketMergeRequestsMenu } from './TicketMergeRequestsMenu'
