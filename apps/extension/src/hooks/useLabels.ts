import { useQuery } from '@tanstack/react-query'

import { getJiraService } from '@/services'
import { queryKeys } from '@/utils/queryKeys'
import { minutes } from '@/utils/time'

export function useLabels() {
  return useQuery({
    queryKey: queryKeys.labels,
    queryFn: () => getJiraService().getLabels(),
    staleTime: minutes(5)
  })
}
