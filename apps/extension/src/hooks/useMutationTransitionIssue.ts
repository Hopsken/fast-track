import { useMutation, useQueryClient } from '@tanstack/react-query'

import { ticketService } from '@/services'
import { JiraTicket, JiraTransition } from '@/types'
import { queryKeys } from '@/utils/queryKeys'
import { showToast } from '~/stores/useToastStore'
import { formatErrorMessage } from '~/utils/formatError'

export function useMutationTransitionIssue() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (params: {
      ticket: JiraTicket
      transition: JiraTransition
    }) => {
      await ticketService.transitionTicket(params.ticket, params.transition)
    },
    onMutate: ({ ticket, transition }) => {
      const nextStatus = transition.to.name || transition.name || 'Status'
      const toast = showToast({
        style: 'loading',
        title: 'Updating status...',
        message: `${ticket.key} -> ${nextStatus}`
      })

      return { toast, nextStatus }
    },
    onSuccess: (_, { ticket }, context) => {
      const nextStatus = context?.nextStatus || 'Status'
      context?.toast.update({
        style: 'success',
        title: 'Status updated',
        message: `${ticket.key} to ${nextStatus}`
      })
      queryClient.invalidateQueries({
        queryKey: queryKeys.issue.transitions(ticket)
      })
    },
    onError: (error, _, context) => {
      context?.toast.update({
        style: 'failure',
        title: 'Status update failed',
        message: formatErrorMessage(error)
      })
    }
  })
}
