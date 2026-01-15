import { useQuery } from '@tanstack/react-query'

import { ticketService } from '@/services'
import { IssueSuggestion } from '@/services/ticket-service'
import { queryKeys } from '@/utils/queryKeys'
import { days } from '@/utils/time'

export function useIssueSuggestions() {
  const queryKey = queryKeys.tickets.suggestions

  return useQuery<IssueSuggestion>({
    queryKey,
    queryFn: () => ticketService.getIssueSuggestions(),
    gcTime: days(2)
  })
}
