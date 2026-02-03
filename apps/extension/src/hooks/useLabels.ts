import { useQuery } from '@tanstack/react-query'

import { jiraService } from '@/services'
import { queryKeys } from '@/utils/queryKeys'
import { minutes } from '@/utils/time'

export function useLabels() {
  return useQuery({
    queryKey: queryKeys.labels,
    queryFn: () => jiraService.getLabels(),
    staleTime: minutes(5)
  })
}
