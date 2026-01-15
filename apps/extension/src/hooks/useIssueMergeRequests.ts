import { useQuery } from '@tanstack/react-query'

import { ticketService } from '@/services'
import { JiraMergeRequest, JiraTicket } from '@/types'
import { queryKeys } from '@/utils/queryKeys'
import { minutes } from '@/utils/time'

export const useIssueMergeRequests = (ticket: JiraTicket) => {
  return useQuery<JiraMergeRequest[]>({
    queryKey: queryKeys.tickets.mergeRequests(ticket),
    enabled: !!ticket.key,
    queryFn: async () => {
      if (!ticket.key) return []
      return ticketService.getIssueMergeRequests(ticket.key)
    },
    staleTime: minutes(5),
    gcTime: minutes(30)
  })
}
