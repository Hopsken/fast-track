import { useQuery } from '@tanstack/react-query'

import { jiraService } from '@/services'
import { JiraMergeRequest } from '@/types'
import { queryKeys } from '@/utils/queryKeys'
import { minutes } from '@/utils/time'

export const useIssueMergeRequests = (ticketKey: string) => {
  return useQuery<JiraMergeRequest[]>({
    queryKey: queryKeys.tickets.mergeRequests(ticketKey),
    enabled: !!ticketKey,
    queryFn: () => jiraService.issues.getIssueMergeRequests(ticketKey),
    gcTime: minutes(30)
  })
}
