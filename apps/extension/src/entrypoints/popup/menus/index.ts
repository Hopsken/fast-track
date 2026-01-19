import { JiraTicket } from '@/types'

export type CommandRoutes = {
  '/': void
  '/actions': JiraTicket
  '/ticket/merge-requests': JiraTicket
  '/ticket/assign': { ticketKey: string }
  '/ticket/status': { ticketKey: string }
  '/ticket/priority': { ticketKey: string }
  '/ticket/details': JiraTicket
}

export { SearchResultMenu } from './SearchResultMenu'
export { TicketActionsMenu } from './TicketActionsMenu'
export { TicketAssignMenu } from './TicketAssignMenu'
export { TicketStatusMenu } from './TicketStatusMenu'
export { TicketPriorityMenu } from './TicketPriorityMenu'
export { TicketMergeRequestsMenu } from './TicketMergeRequestsMenu'
