import { useQuery } from '@tanstack/react-query'

import { ticketService } from '@/services'
import { IssueSuggestion } from '@/services/ticket-service'
import { queryKeys } from '@/utils/queryKeys'
import { days, minutes } from '@/utils/time'

export function useIssueSuggestions() {
  const queryKey = queryKeys.tickets.suggestions

  return useQuery<IssueSuggestion>({
    queryKey,
    queryFn: () => ticketService.getIssueSuggestions(),
    staleTime: minutes(5),
    gcTime: days(2)
  })
}
