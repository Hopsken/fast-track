import { useQuery, useQueryClient } from '@tanstack/react-query'

import { suggestionService } from '@/services'
import { IssueSuggestion } from '@/services/suggestion-service'
import { queryKeys } from '@/utils/queryKeys'
import { minutes } from '@/utils/time'

export function useFrequentProjects() {
  const queryClient = useQueryClient()

  return useQuery<string[]>({
    queryKey: queryKeys.projects.frequent,
    queryFn: () => {
      const suggestions = queryClient.getQueryData<IssueSuggestion>(
        queryKeys.tickets.suggestions
      )
      return suggestionService.getFrequentProjectKeys(suggestions)
    },
    staleTime: minutes(1),
    gcTime: minutes(5)
  })
}
