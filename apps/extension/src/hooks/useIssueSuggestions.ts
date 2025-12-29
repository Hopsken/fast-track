import { useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { differenceBy } from 'lodash-es'

import { onMessage } from '@/lib/message'
import { ticketService } from '@/services'
import { IssueSuggestion } from '@/services/ticket-service'
import { queryKeys } from '@/utils/queryKeys'

const mergeSuggestions = (
  prev?: IssueSuggestion,
  next?: Partial<IssueSuggestion>
): IssueSuggestion => {
  const inProgress = next?.inProgress ?? prev?.inProgress ?? []
  const activeSprintTodo =
    next?.activeSprintTodo ?? prev?.activeSprintTodo ?? []
  const viewHistory = next?.viewHistory ?? prev?.viewHistory ?? []

  return {
    inProgress,
    activeSprintTodo: differenceBy(activeSprintTodo, inProgress, 'key'),
    viewHistory: differenceBy(
      viewHistory,
      inProgress.concat(activeSprintTodo),
      'key'
    )
  }
}

export function useIssueSuggestions() {
  const queryClient = useQueryClient()
  const queryKey = queryKeys.tickets.suggestions

  useEffect(() => {
    return onMessage('onIssueSuggestionsUpdated', (message) => {
      queryClient.setQueryData<IssueSuggestion>(queryKey, (prev) =>
        mergeSuggestions(prev, message.data)
      )
    })
  }, [queryClient, queryKey])

  return useQuery<IssueSuggestion>({
    queryKey,
    queryFn: () =>
      ticketService
        .getIssueSuggestions()
        .then((suggestions) => mergeSuggestions(undefined, suggestions)),
    staleTime: Infinity
  })
}
