import { useQuery } from '@tanstack/react-query'

import { usePrefetchOptionsIfApplicable } from '@/components/PrefetchQuery'
import { getJiraService } from '@/services'
import { JiraTicket } from '@/types'
import { queryKeys } from '@/utils/queryKeys'
import { minutes } from '@/utils/time'

export function useIssueTransitions(issue: JiraTicket) {
  const queryOptions = usePrefetchOptionsIfApplicable()
  return useQuery({
    ...queryOptions,
    queryKey: queryKeys.tickets.transitions(issue),
    staleTime: minutes(1),
    queryFn: async () => {
      const result = await getJiraService().issues.getIssueTransitions(issue)
      return result ?? []
    }
  })
}
