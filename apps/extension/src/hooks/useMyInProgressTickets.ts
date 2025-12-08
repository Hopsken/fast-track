import { useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'

import { onMessage } from '@/lib/message'
import { ticketService } from '@/services'
import { JiraTicket } from '@/types'
import { queryKeys } from '@/utils/queryKeys'

type Options = {
  enabled?: boolean
}

export function useMyInProgressTickets(options?: Options) {
  const { enabled = true } = options ?? {}
  const queryClient = useQueryClient()
  const queryKey = queryKeys.tickets.myInProgress

  useEffect(() => {
    if (!enabled) return

    return onMessage('onMyInProgressUpdated', (message) => {
      queryClient.setQueryData<JiraTicket[]>(queryKey, message.data.tickets)
    })
  }, [enabled, queryClient, queryKey])

  return useQuery<JiraTicket[]>({
    queryKey,
    queryFn: async () => ticketService.getMyInProgressTickets(),
    staleTime: 1000 * 60,
    enabled
  })
}
