import { TicketDetails } from '@/components'

import { useCurrentTicketKey } from './useCurrentTicket'

export function TicketDetailsMenu() {
  const ticketKey = useCurrentTicketKey()
  return <TicketDetails ticketKey={ticketKey} />
}
