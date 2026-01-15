import { useMutation } from '@tanstack/react-query'

import { ticketService } from '@/services'
import { JiraPriority, JiraTicket } from '@/types'
import { showToast } from '~/stores/useToastStore'
import { formatErrorMessage } from '~/utils/formatError'

export function useMutationUpdatePriority() {
  return useMutation({
    mutationFn: async (params: {
      ticket: JiraTicket
      priority: JiraPriority
    }) => {
      const updated = await ticketService.updateTicketPriority(
        params.ticket,
        params.priority
      )
      // Return updated ticket for normy to normalize
      return updated ?? { ...params.ticket, priority: params.priority }
    },
    onMutate: async ({ ticket, priority }) => {
      const toast = showToast({
        style: 'loading',
        title: 'Updating priority...',
        message: `${ticket.key} -> ${priority.name}`
      })

      // Return optimisticData for normy to apply immediately
      return {
        toast,
        priorityName: priority.name,
        optimisticData: {
          __typename: 'JiraTicket' as const,
          key: ticket.key,
          priority,
          updated: new Date().toISOString()
        }
      }
    },
    onSuccess: (_, { ticket }, context) => {
      const priorityName = context?.priorityName ?? 'priority'
      context?.toast.update({
        style: 'success',
        title: 'Priority updated',
        message: `${ticket.key} set to ${priorityName}`
      })
    },
    onError: (error, _, context) => {
      // normy automatically handles rollback when optimisticData was provided
      context?.toast.update({
        style: 'failure',
        title: 'Priority update failed',
        message: formatErrorMessage(error)
      })
    }
  })
}
