import { useQueryNormalizer } from '@normy/react-query'
import { useQuery } from '@tanstack/react-query'

import { getJiraService } from '@/services'
import { JiraIssueDetail } from '@/types'
import { queryKeys } from '@/utils/queryKeys'
import { minutes } from '@/utils/time'

export const useTicketDetails = (key: string) => {
  const queryNormalizer = useQueryNormalizer()

  return useQuery<JiraIssueDetail>({
    queryKey: queryKeys.tickets.detail(key),
    enabled: !!key,
    queryFn: () => getJiraService().issues.getIssueDetail(key),
    staleTime: minutes(1),
    placeholderData: () => {
      // Try to get the latest normalized data for this ticket from the cache
      const normalized = queryNormalizer.getObjectById(`JiraIssue:${key}`) as
        | JiraIssueDetail
        | undefined
      return normalized
    }
  })
}
