import { useQuery } from '@tanstack/react-query'

import { ticketService } from '@/services'
import { IssueDetail, JiraTicket } from '@/types'
import { queryKeys } from '@/utils/queryKeys'

export const useTicketDetails = (ticket: JiraTicket) => {
  return useQuery<IssueDetail | null>({
    queryKey: queryKeys.tickets.detail(ticket.key),
    enabled: !!ticket.key,
    queryFn: async () => {
      if (!ticket.key) return null
      return ticketService.getTicketDetails(ticket.key)
    },
    placeholderData: ticket as IssueDetail
  })
}
