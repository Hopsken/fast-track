import { useQuery } from '@tanstack/react-query'

import { usePrefetchOptionsIfApplicable } from '@/components/PrefetchQuery'
import { jiraService } from '@/services'
import { JiraTicket } from '@/types'
import { queryKeys } from '@/utils/queryKeys'
import { minutes } from '@/utils/time'

export function useIssueEditMeta(issue: JiraTicket) {
  const queryOptions = usePrefetchOptionsIfApplicable()
  return useQuery({
    ...queryOptions,
    queryKey: queryKeys.tickets.editMeta(issue),
    staleTime: minutes(5),
    queryFn: async () => {
      const result = await jiraService.proxyCall(
        'issues.getIssueEditMetadata',
        issue
      )

      return result as {
        fields?: {
          assignee?: {
            autoCompleteUrl: string
          }
        }
      }
    }
  })
}
