import { useQuery } from '@tanstack/react-query'

import { usePrefetchOptionsIfApplicable } from '@/components/PrefetchQuery'
import { ticketService } from '@/services'
import { JiraComment } from '@/types'
import { queryKeys } from '@/utils/queryKeys'
import { minutes } from '@/utils/time'

export const useIssueComments = (ticketKey: string) => {
  const queryOptions = usePrefetchOptionsIfApplicable()

  return useQuery<JiraComment[]>({
    ...queryOptions,
    queryKey: queryKeys.tickets.comments(ticketKey),
    enabled: !!ticketKey,
    queryFn: () => ticketService.getIssueComments(ticketKey),
    staleTime: minutes(1),
    gcTime: minutes(10)
  })
}
