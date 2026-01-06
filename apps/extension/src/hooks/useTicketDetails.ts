import { useQuery } from '@tanstack/react-query'

import { ticketService } from '@/services'
import { IssueDetail } from '@/types'
import { queryKeys } from '@/utils/queryKeys'
import { minutes } from '@/utils/time'

export const useTicketDetails = (issueKey: string | undefined) => {
  return useQuery<IssueDetail | null>({
    queryKey: queryKeys.tickets.detail(issueKey ?? ''),
    enabled: !!issueKey,
    queryFn: async () => {
      if (!issueKey) return null
      return ticketService.getTicketDetails(issueKey)
    },
    staleTime: minutes(5),
    gcTime: minutes(30)
  })
}
