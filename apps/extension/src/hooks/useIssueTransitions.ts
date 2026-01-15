import { useQuery } from '@tanstack/react-query'

import { usePrefetchOptionsIfApplicable } from '@/components/PrefetchQuery'
import { jiraService } from '@/services'
import { JiraTicket } from '@/types'
import { queryKeys } from '@/utils/queryKeys'

export function useIssueTransitions(issue: JiraTicket) {
  const queryOptions = usePrefetchOptionsIfApplicable()
  return useQuery({
    ...queryOptions,
    queryKey: queryKeys.tickets.transitions(issue),
    staleTime: 1000 * 60 * 5,
    queryFn: async () => {
      const result = await jiraService.proxyCall(
        'issues.getIssueTransitions',
        issue
      )

      return result ?? []
    }
  })
}
