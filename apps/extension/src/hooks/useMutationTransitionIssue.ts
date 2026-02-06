import { useMutation, useQueryClient } from '@tanstack/react-query'
import log from 'loglevel'

import {
  mapCurrentUserToAssignee,
  shouldAutoAssignOnTransition
} from '@/lib/tickets/auto-assign'
import type { JiraIssue, JiraTransition } from '@/repository/schema'
import { getJiraService } from '@/services'
import { showToast } from '@/stores/command/useToastStore'
import { useCurrentUser } from '@/stores/useCurrentUser'
import { UserPreferences } from '@/types'
import { generateBranchName } from '@/utils/jira/issues'
import { queryKeys } from '@/utils/queryKeys'
import { useUserPreferences } from '~/stores/useUserPreferences'
import { formatErrorMessage } from '~/utils/formatError'

export function useMutationTransitionIssue() {
  const queryClient = useQueryClient()
  const [preferences] = useUserPreferences()
  const currentUser = useCurrentUser()

  return useMutation({
    mutationFn: async (params: {
      ticket: JiraIssue
      transition: JiraTransition
    }) => {
      const shouldAutoAssign =
        !!currentUser &&
        shouldAutoAssignOnTransition(
          preferences,
          params.ticket,
          params.transition
        )

      const updated = await getJiraService().issues.transitionIssue(
        params.ticket.key,
        params.transition,
        shouldAutoAssign ? { autoAssign: { assignee: currentUser } } : undefined
      )

      // Return updated ticket for normy to normalize
      return (
        updated ?? {
          ...params.ticket,
          status: params.transition.to,
          isInProgress:
            params.transition.to.statusCategory?.key === 'indeterminate'
        }
      )
    },
    onMutate: async ({ ticket, transition }) => {
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

      // Build optimistic update for normy
      const optimisticData: Record<string, unknown> = {
        __typename: 'JiraTicket',
        key: ticket.key,
        status: transition.to,
        isInProgress: transition.to.statusCategory?.key === 'indeterminate',
        updated: new Date().toISOString()
      }

      if (willAutoAssign && currentUser) {
        optimisticData.assignee = mapCurrentUserToAssignee(currentUser)
      }

      return { toast, nextStatus, optimisticData }
    },
    onSuccess: async (_, { ticket }, context) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.tickets.keys(ticket.key)
      })
      queryClient.invalidateQueries({
        queryKey: queryKeys.tickets.suggestions,
        type: 'all'
      })

      const nextStatus = context?.nextStatus || 'Status'
      const message = `${ticket.key} to ${nextStatus}`

      context?.toast.update({
        style: 'success',
        title: 'Status updated',
        message
      })
    },
    onError: (error, _, context) => {
      // normy automatically handles rollback when optimisticData was provided
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
  ticket: JiraIssue,
  transition: JiraTransition
) {
  return (
    preferences.autoCopyBranchNameOnTransition &&
    ticket.status?.statusCategory?.key?.toLowerCase() === 'new' &&
    transition.to.statusCategory?.key?.toLowerCase() === 'indeterminate'
  )
}
