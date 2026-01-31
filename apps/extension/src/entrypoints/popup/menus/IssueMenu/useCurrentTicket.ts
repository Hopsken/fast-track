import { useParams } from 'react-router-dom'

import { useTicketDetails } from '@/hooks/useTicketDetails'

export const useCurrentTicketKey = () => {
  const { ticketKey } = useParams<{ ticketKey: string }>()
  if (!ticketKey)
    throw new Error('useCurrentTicket can only be used under IssueDetailsMenu')
  return ticketKey
}

export function useCurrentTicket() {
  const ticketKey = useCurrentTicketKey()
  return useTicketDetails(ticketKey)
}
