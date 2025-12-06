import { useQuery } from '@tanstack/react-query'

import { usePrefetchOptionsIfApplicable } from '@/components/PrefetchQuery'
import { jiraService } from '@/services'
import { JiraTicket } from '@/types'
import { queryKeys } from '@/utils/queryKeys'

export function useIssueEditMeta(issue: JiraTicket) {
  const queryOptions = usePrefetchOptionsIfApplicable()
  return useQuery({
    ...queryOptions,
    queryKey: queryKeys.issue.editMeta(issue),
    staleTime: 1000 * 60 * 5,
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
