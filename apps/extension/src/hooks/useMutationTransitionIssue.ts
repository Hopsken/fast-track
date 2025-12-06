import { useMutation, useQueryClient } from '@tanstack/react-query'

import { ticketService } from '@/services'
import { JiraTicket, JiraTransition } from '@/types'
import { queryKeys } from '@/utils/queryKeys'

export function useMutationTransitionIssue() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (params: {
      ticket: JiraTicket
      transition: JiraTransition
    }) => {
      await ticketService.transitionTicket(params.ticket, params.transition)
    },
    onSuccess: (_, { ticket }) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.issue.transitions(ticket)
      })
    }
  })
}
