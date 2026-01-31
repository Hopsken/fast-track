import { useOutletContext, useParams } from 'react-router-dom'

import { IssueDetail } from '@/types'

export const useCurrentTicketKey = () => {
  const { ticketKey } = useParams<{ ticketKey: string }>()
  if (!ticketKey)
    throw new Error('useCurrentTicket can only be used under IssueDetailsMenu')
  return ticketKey
}

export function useCurrentTicket() {
  return useOutletContext<IssueDetail>()
}
