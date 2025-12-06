import { JiraTicket } from '@/types'

export type CommandRoutes = {
  '/': void
  '/actions': JiraTicket
  '/ticket/assign': JiraTicket
  '/ticket/status': JiraTicket
  '/ticket/priority': JiraTicket
  '/ticket/comment': JiraTicket
}

export { SearchResultMenu } from './SearchResultMenu'
export { TicketActionsMenu } from './TicketActionsMenu'
