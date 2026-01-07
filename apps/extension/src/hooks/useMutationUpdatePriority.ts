import { useMutation, useQueryClient } from '@tanstack/react-query'

import { ticketService } from '@/services'
import { JiraPriority, JiraTicket } from '@/types'
import { queryKeys } from '@/utils/queryKeys'
import {
  invalidateTicketCaches,
  restoreTicketCaches,
  updateTicketCaches
} from '@/utils/ticket-cache'
import { showToast } from '~/stores/useToastStore'
import { formatErrorMessage } from '~/utils/formatError'

export function useMutationUpdatePriority() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (params: {
      ticket: JiraTicket
      priority: JiraPriority
    }) => {
      await ticketService.updateTicketPriority(params.ticket, params.priority)
    },
    onMutate: async ({ ticket, priority }) => {
      await queryClient.cancelQueries({
        queryKey: queryKeys.tickets.suggestions
      })
      await queryClient.cancelQueries({
        queryKey: queryKeys.tickets.detail(ticket.key)
      })

      const toast = showToast({
        style: 'loading',
        title: 'Updating priority...',
        message: `${ticket.key} -> ${priority.name}`
      })

      const snapshot = updateTicketCaches(queryClient, ticket.key, {
        priority
      })

      return { toast, priorityName: priority.name, snapshot }
    },
    onSuccess: (_, { ticket }, context) => {
      const priorityName = context?.priorityName ?? 'priority'
      context?.toast.update({
        style: 'success',
        title: 'Priority updated',
        message: `${ticket.key} set to ${priorityName}`
      })
      invalidateTicketCaches(queryClient, ticket.key)
    },
    onError: (error, _, context) => {
      restoreTicketCaches(queryClient, context?.snapshot)
      context?.toast.update({
        style: 'failure',
        title: 'Priority update failed',
        message: formatErrorMessage(error)
      })
    }
  })
}
