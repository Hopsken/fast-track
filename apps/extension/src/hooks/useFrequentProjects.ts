import { useQuery } from '@tanstack/react-query'

import { ticketService } from '@/services'
import { queryKeys } from '@/utils/queryKeys'
import { days } from '@/utils/time'

export function useFrequentProjects() {
  return useQuery<string[]>({
    queryKey: queryKeys.projects.frequent,
    queryFn: () => {
      return ticketService.getFrequentProjects()
    },
    staleTime: days(1),
    gcTime: days(2)
  })
}
