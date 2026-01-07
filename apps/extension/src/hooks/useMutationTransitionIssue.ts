import { useMutation, useQueryClient } from '@tanstack/react-query'

import { ticketService } from '@/services'
import { JiraTicket, JiraTransition } from '@/types'
import { generateBranchName } from '@/utils/jira/issues'
import { queryKeys } from '@/utils/queryKeys'
import {
  invalidateTicketCaches,
  restoreTicketCaches,
  updateTicketCaches
} from '@/utils/ticket-cache'
import { showToast } from '~/stores/useToastStore'
import { useUserPreferences } from '~/stores/useUserPreferences'
import { formatErrorMessage } from '~/utils/formatError'

export function useMutationTransitionIssue() {
  const queryClient = useQueryClient()
  const [preferences] = useUserPreferences()
  return useMutation({
    mutationFn: async (params: {
      ticket: JiraTicket
      transition: JiraTransition
    }) => {
      await ticketService.transitionTicket(params.ticket, params.transition)
    },
    onMutate: async ({ ticket, transition }) => {
      await queryClient.cancelQueries({
        queryKey: queryKeys.tickets.suggestions
      })
      await queryClient.cancelQueries({
        queryKey: queryKeys.tickets.detail(ticket.key)
      })

      const nextStatus = transition.to.name || transition.name || 'Status'
      const toast = showToast({
        style: 'loading',
        title: 'Updating status...',
        message: `${ticket.key} -> ${nextStatus}`
      })

      const snapshot = updateTicketCaches(queryClient, ticket.key, {
        status: transition.to,
        isInProgress: transition.to.statusCategory?.key === 'indeterminate'
      })

      return { toast, nextStatus, snapshot }
    },
    onSuccess: async (_, { ticket, transition }, context) => {
      const nextStatus = context?.nextStatus || 'Status'
      const isPending =
        ticket.status?.statusCategory?.key?.toLowerCase() === 'new'
      const isInProgress =
        transition.to.statusCategory?.key?.toLowerCase() === 'indeterminate'
      const shouldCopyBranchName =
        preferences.autoCopyBranchNameOnTransition && isPending && isInProgress
      let message = `${ticket.key} to ${nextStatus}`

      if (shouldCopyBranchName) {
        const branchName = generateBranchName(
          ticket,
          preferences.branchNameFormat
        )
        await navigator.clipboard.writeText(branchName)
        message = `${ticket.key} to ${nextStatus} (branch name copied)`
      }

      context?.toast.update({
        style: 'success',
        title: 'Status updated',
        message
      })
      queryClient.invalidateQueries({
        queryKey: queryKeys.issue.transitions(ticket)
      })
      invalidateTicketCaches(queryClient, ticket.key)
    },
    onError: (error, _, context) => {
      restoreTicketCaches(queryClient, context?.snapshot)
      context?.toast.update({
        style: 'failure',
        title: 'Status update failed',
        message: formatErrorMessage(error)
      })
    }
  })
}
