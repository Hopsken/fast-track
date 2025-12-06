import { useQuery } from '@tanstack/react-query'

import { usePrefetchOptionsIfApplicable } from '@/components/PrefetchQuery'
import { jiraService } from '@/services'
import { isNonNullable } from '@/utils/assert'
import { queryKeys } from '@/utils/queryKeys'

export function useIssuePriorities() {
  const queryOptions = usePrefetchOptionsIfApplicable()
  return useQuery({
    ...queryOptions,
    queryKey: queryKeys.priorities,
    staleTime: Infinity,
    queryFn: async () => {
      const result = await jiraService.proxyCall('issues.getPriorities')
      const priorities = Array.isArray(result) ? result : []

      return priorities.filter(isNonNullable)
    }
  })
}
