import { useQuery } from '@tanstack/react-query'

import { suggestionService } from '@/services'
import { IssueSuggestion } from '@/services/suggestion-service'
import { queryKeys } from '@/utils/queryKeys'
import { days, minutes } from '@/utils/time'

export function useIssueSuggestions() {
  const queryKey = queryKeys.tickets.suggestions

  return useQuery<IssueSuggestion>({
    queryKey,
    queryFn: () => suggestionService.getIssueSuggestions(),
    staleTime: minutes(5),
    gcTime: days(2)
  })
}
