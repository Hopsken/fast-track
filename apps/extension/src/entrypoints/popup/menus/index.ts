import { JiraTicket } from '@/types'

export type CommandRoutes = {
  '/': void
  '/actions': JiraTicket
}

export { SearchResultMenu } from './SearchResultMenu'
export { TicketActionsMenu } from './TicketActionsMenu'
