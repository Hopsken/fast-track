import { useQuery } from '@tanstack/react-query'

import { usePrefetchOptionsIfApplicable } from '@/components/PrefetchQuery'
import { getJiraService } from '@/services'
import { queryKeys } from '@/utils/queryKeys'
import { minutes } from '@/utils/time'

export function useIssueEditMeta(ticketKey: string) {
  const queryOptions = usePrefetchOptionsIfApplicable()
  return useQuery({
    ...queryOptions,
    queryKey: queryKeys.tickets.editMeta(ticketKey),
    staleTime: minutes(1),
    queryFn: async () => {
      const result =
        await getJiraService().issues.getIssueEditMetadata(ticketKey)
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
