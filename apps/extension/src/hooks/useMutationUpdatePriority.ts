import { useMutation, useQueryClient } from '@tanstack/react-query'

import { ticketService } from '@/services'
import { showToast } from '@/stores/command/useToastStore'
import { JiraPriority } from '@/types'
import { queryKeys } from '@/utils/queryKeys'
import { formatErrorMessage } from '~/utils/formatError'

export function useMutationUpdatePriority() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (params: {
      ticketKey: string
      priority: JiraPriority
    }) => {
      return ticketService.updateTicketPriority(
        params.ticketKey,
        params.priority
      )
    },
    onMutate: async ({ ticketKey, priority }) => {
      const toast = showToast({
        style: 'loading',
        title: 'Updating priority...',
        message: `${ticketKey} -> ${priority.name}`
      })

      // Return optimisticData for normy to apply immediately
      return {
        toast,
        priorityName: priority.name,
        optimisticData: {
          __typename: 'JiraTicket' as const,
          key: ticketKey,
          priority,
          updated: new Date().toISOString()
        }
      }
    },
    onSuccess: (_, { ticketKey }, context) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.tickets.keys(ticketKey)
      })

      const priorityName = context?.priorityName ?? 'priority'
      context?.toast.update({
        style: 'success',
        title: 'Priority updated',
        message: `${ticketKey} set to ${priorityName}`
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
