import { useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'

import { onMessage } from '@/lib/message'
import { ticketService } from '@/services'
import { IssueSuggestion } from '@/services/ticket-service'
import { queryKeys } from '@/utils/queryKeys'

export function useIssueSuggestions() {
  const queryClient = useQueryClient()
  const queryKey = queryKeys.tickets.myInProgress

  useEffect(() => {
    return onMessage('onIssueSuggestionsUpdated', (message) => {
      queryClient.setQueryData<IssueSuggestion>(queryKey, (prev) =>
        Object.assign({}, prev, message.data)
      )
    })
  }, [queryClient, queryKey])

  return useQuery<IssueSuggestion>({
    queryKey,
    queryFn: () => ticketService.getIssueSuggestions(),
    staleTime: 1000 * 60
  })
}
