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
      await ticketService.updateTicketPriority(params.ticket, params.priority)
    },
    onMutate: ({ ticket, priority }) => {
      const toast = showToast({
        style: 'loading',
        title: 'Updating priority...',
        message: `${ticket.key} -> ${priority.name}`
      })

      return { toast, priorityName: priority.name }
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
      context?.toast.update({
        style: 'failure',
        title: 'Priority update failed',
        message: formatErrorMessage(error)
      })
    }
  })
}
