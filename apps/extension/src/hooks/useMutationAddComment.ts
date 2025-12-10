import { useMutation } from '@tanstack/react-query'

import { ticketService } from '@/services'
import { JiraTicket } from '@/types'
import { showToast } from '~/stores/useToastStore'
import { formatErrorMessage } from '~/utils/formatError'

export function useMutationAddComment() {
  return useMutation({
    mutationFn: async (params: { ticket: JiraTicket; comment: string }) => {
      await ticketService.addComment(params.ticket, params.comment)
    },
    onMutate: ({ ticket, comment }) => {
      const toast = showToast({
        style: 'loading',
        title: 'Adding comment...',
        message: `${ticket.key}: ${comment}`
      })

      return { toast }
    },
    onSuccess: (_, { ticket }, context) => {
      context?.toast.update({
        style: 'success',
        title: 'Comment added',
        message: ticket.key
      })
    },
    onError: (error, { ticket }, context) => {
      context?.toast.update({
        style: 'failure',
        title: 'Add comment failed',
        message: `${ticket.key}: ${formatErrorMessage(error)}`
      })
    }
  })
}
