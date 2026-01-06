import { JiraTicket } from '@/types'

export type CommandRoutes = {
  '/': void
  '/actions': JiraTicket
  '/ticket/assign': JiraTicket
  '/ticket/status': JiraTicket
  '/ticket/priority': JiraTicket
  '/ticket/description': { issueKey: string }
}

export { SearchResultMenu } from './SearchResultMenu'
export { TicketActionsMenu } from './TicketActionsMenu'
export { TicketAssignMenu } from './TicketAssignMenu'
export { TicketStatusMenu } from './TicketStatusMenu'
export { TicketPriorityMenu } from './TicketPriorityMenu'
