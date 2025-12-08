import { useCallback, useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'

import { onMessage } from '@/lib/message'
import { ticketService } from '@/services'
import { IssueSuggestion } from '@/services/ticket-service'
import { queryKeys } from '@/utils/queryKeys'

export function useIssueSuggestions() {
  const queryClient = useQueryClient()
  const queryKey = queryKeys.tickets.suggestions

  const mergeSuggestions = useCallback(
    (
      prev?: IssueSuggestion,
      next?: Partial<IssueSuggestion>
    ): IssueSuggestion => {
      return {
        inProgress: next?.inProgress ?? prev?.inProgress ?? [],
        activeSprintTodo: next?.activeSprintTodo ?? prev?.activeSprintTodo ?? []
      }
    },
    []
  )

  useEffect(() => {
    return onMessage('onIssueSuggestionsUpdated', (message) => {
      queryClient.setQueryData<IssueSuggestion>(queryKey, (prev) =>
        mergeSuggestions(prev, message.data)
      )
    })
  }, [mergeSuggestions, queryClient, queryKey])

  return useQuery<IssueSuggestion>({
    queryKey,
    queryFn: () =>
      ticketService
        .getIssueSuggestions()
        .then((suggestions) => mergeSuggestions(undefined, suggestions)),
    staleTime: 1000 * 60
  })
}
