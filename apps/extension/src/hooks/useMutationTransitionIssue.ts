import { useMutation, useQueryClient } from '@tanstack/react-query'
import log from 'loglevel'

import {
  mapCurrentUserToAssignee,
  shouldAutoAssignOnTransition
} from '@/lib/tickets/auto-assign'
import { ticketService } from '@/services'
import { useCurrentUser } from '@/stores/useCurrentUser'
import { JiraTicket, JiraTransition, UserPreferences } from '@/types'
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
  const currentUser = useCurrentUser()
  return useMutation({
    mutationFn: async (params: {
      ticket: JiraTicket
      transition: JiraTransition
    }) => {
      await ticketService.transitionTicket(params.ticket, params.transition)
      const shouldAutoAssign =
        !!currentUser &&
        shouldAutoAssignOnTransition(
          preferences,
          params.ticket,
          params.transition
        )
      if (shouldAutoAssign && currentUser) {
        try {
          await ticketService.assignTicket(params.ticket.key, currentUser)
        } catch (error) {
          showToast({
            style: 'failure',
            title: 'Failed to assign ticket',
            message: formatErrorMessage(error)
          })
        }
      }
    },
    onMutate: async ({ ticket, transition }) => {
      await queryClient.cancelQueries({
        queryKey: queryKeys.tickets.suggestions
      })
      await queryClient.cancelQueries({
        queryKey: queryKeys.tickets.detail(ticket.key)
      })

      const nextStatus = transition.to.name || transition.name || 'Status'
      let message = `${ticket.key} -> ${nextStatus}`

      const willCopyBranchName = shouldCopyBranchName(
        preferences,
        ticket,
        transition
      )
      const willAutoAssign =
        !!currentUser &&
        shouldAutoAssignOnTransition(preferences, ticket, transition)

      if (willCopyBranchName) {
        const branchName = generateBranchName(
          ticket,
          preferences.branchNameFormat
        )
        try {
          await navigator.clipboard.writeText(branchName)
          message = `${ticket.key} to ${nextStatus} (branch name copied)`
        } catch (error) {
          log.error('Failed to copy branch name to clipboard', error)
        }
      }

      if (willAutoAssign) {
        message = `${ticket.key} to ${nextStatus} (assigning to you)`
      }

      const toast = showToast({
        style: 'loading',
        title: 'Updating status...',
        message
      })

      const snapshot = updateTicketCaches(queryClient, ticket.key, {
        status: transition.to,
        isInProgress: transition.to.statusCategory?.key === 'indeterminate',
        assignee:
          willAutoAssign && currentUser
            ? mapCurrentUserToAssignee(currentUser)
            : ticket.assignee
      })

      return { toast, nextStatus, snapshot }
    },
    onSuccess: async (_, { ticket }, context) => {
      const nextStatus = context?.nextStatus || 'Status'
      const message = `${ticket.key} to ${nextStatus}`

      context?.toast.update({
        style: 'success',
        title: 'Status updated',
        message
      })
      queryClient.invalidateQueries({
        queryKey: queryKeys.tickets.transitions(ticket)
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

function shouldCopyBranchName(
  preferences: UserPreferences,
  ticket: JiraTicket,
  transition: JiraTransition
) {
  return (
    preferences.autoCopyBranchNameOnTransition &&
    ticket.status?.statusCategory?.key?.toLowerCase() === 'new' &&
    transition.to.statusCategory?.key?.toLowerCase() === 'indeterminate'
  )
}
