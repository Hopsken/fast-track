import { useQuery } from '@tanstack/react-query'

import { jiraService } from '@/services'
import { isNonNullable } from '@/utils/assert'
import { queryKeys } from '@/utils/queryKeys'

export function useIssuePriorities() {
  return useQuery({
    queryKey: queryKeys.priorities,
    staleTime: Infinity,
    queryFn: async () => {
      const result = await jiraService.proxyCall('issues.getPriorities')
      const priorities = Array.isArray(result) ? result : []

      return priorities.filter(isNonNullable)
    }
  })
}
