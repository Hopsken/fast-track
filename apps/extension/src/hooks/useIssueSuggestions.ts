import { useQuery } from '@tanstack/react-query'
import { differenceBy } from 'lodash-es'

import { ticketService } from '@/services'
import { IssueSuggestion } from '@/services/ticket-service'
import { queryKeys } from '@/utils/queryKeys'
import { days, minutes } from '@/utils/time'

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
  const queryKey = queryKeys.tickets.suggestions

  return useQuery<IssueSuggestion>({
    queryKey,
    queryFn: () =>
      ticketService
        .getIssueSuggestions()
        .then((suggestions) => mergeSuggestions(undefined, suggestions)),
    staleTime: minutes(2),
    gcTime: days(2)
  })
}
