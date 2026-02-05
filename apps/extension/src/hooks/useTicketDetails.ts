import { useQueryNormalizer } from '@normy/react-query'
import { useQuery } from '@tanstack/react-query'

import { jiraService } from '@/services'
import { IssueDetail } from '@/types'
import { queryKeys } from '@/utils/queryKeys'
import { minutes } from '@/utils/time'

export const useTicketDetails = (key: string) => {
  const queryNormalizer = useQueryNormalizer()

  return useQuery<IssueDetail>({
    queryKey: queryKeys.tickets.detail(key),
    enabled: !!key,
    queryFn: () => jiraService.issues.getIssueDetail(key),
    staleTime: minutes(1),
    placeholderData: () => {
      // Try to get the latest normalized data for this ticket from the cache
      const normalized = queryNormalizer.getObjectById(`JiraTicket:${key}`) as
        | IssueDetail
        | undefined
      return normalized
    }
  })
}
