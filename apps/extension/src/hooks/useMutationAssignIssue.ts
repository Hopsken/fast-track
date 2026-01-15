import { useMutation } from '@tanstack/react-query'
import { UserDetails } from 'jira.js/version3/models/userDetails'

import { ticketService } from '@/services'
import { useCurrentUser } from '@/stores/useCurrentUser'
import { JiraTicket, JiraUserInfo } from '@/types'
import { mapUserToAssignee } from '@/utils/jira/issues'
import { showToast } from '~/stores/useToastStore'
import { formatErrorMessage } from '~/utils/formatError'

export function useMutationAssignIssue() {
  return useMutation({
    mutationFn: async (params: {
      ticket: JiraTicket
      assignee: UserDetails | null
    }) => {
      const updated = await ticketService.assignTicket(
        params.ticket.key,
        params.assignee
      )
      // Return updated ticket for normy to normalize
      return (
        updated ?? {
          ...params.ticket,
          assignee: params.assignee ? mapUserToAssignee(params.assignee) : null
        }
      )
    },
    onMutate: async ({ ticket, assignee }) => {
      const isUnassign = !assignee
      const displayName =
        assignee?.displayName ||
        assignee?.name ||
        assignee?.emailAddress ||
        'No assignee'

      const toast = showToast({
        style: 'loading',
        title: isUnassign ? 'Removing assignment...' : 'Assigning...',
        message: isUnassign ? ticket.key : `${ticket.key} -> ${displayName}`
      })

      // Return optimisticData for normy to apply immediately
      return {
        toast,
        displayName,
        isUnassign,
        optimisticData: {
          __typename: 'JiraTicket' as const,
          key: ticket.key,
          assignee: assignee ? mapUserToAssignee(assignee) : null,
          updated: new Date().toISOString()
        }
      }
    },
    onSuccess: (_, { ticket }, context) => {
      const displayName = context?.displayName ?? 'No assignee'
      const isUnassign = context?.isUnassign
      context?.toast.update({
        style: 'success',
        title: isUnassign ? 'Unassigned' : 'Assigned',
        message: isUnassign
          ? `${ticket.key} unassigned`
          : `${ticket.key} assigned to ${displayName}`
      })
    },
    onError: (error, _, context) => {
      // normy automatically handles rollback when optimisticData was provided
      const isUnassign = context?.isUnassign
      context?.toast.update({
        style: 'failure',
        title: isUnassign ? 'Unassign failed' : 'Assign failed',
        message: formatErrorMessage(error)
      })
    }
  })
}

export function useMutationAssignMyself() {
  const myself = useCurrentUser()
  const mapCurrentUserToAssignee = (user: JiraUserInfo) =>
    mapUserToAssignee({
      displayName: user.name,
      name: user.name,
      emailAddress: user.email,
      avatarUrls: { '48x48': user.avatarUrl ?? '' }
    } as UserDetails)

  return useMutation({
    mutationFn: async (params: { ticket: JiraTicket; assign: boolean }) => {
      if (!myself)
        throw new Error('useMutationAssignMyself: myself is required')

      const updated = await ticketService.assignTicket(
        params.ticket.key,
        params.assign ? myself : null
      )
      // Return updated ticket for normy to normalize
      return (
        updated ?? {
          ...params.ticket,
          assignee: params.assign ? mapCurrentUserToAssignee(myself) : null
        }
      )
    },
    onMutate: async ({ ticket, assign }) => {
      if (!myself)
        throw new Error('useMutationAssignMyself: myself is required')

      const toast = showToast({
        style: 'loading',
        title: assign ? 'Assigning to you...' : 'Removing assignment...',
        message: ticket.key
      })

      // Return optimisticData for normy to apply immediately
      return {
        toast,
        optimisticData: {
          __typename: 'JiraTicket' as const,
          key: ticket.key,
          assignee: assign ? mapCurrentUserToAssignee(myself) : null,
          updated: new Date().toISOString()
        }
      }
    },
    onSuccess: (_, { ticket, assign }, context) => {
      context?.toast.update({
        style: 'success',
        title: assign ? 'Assigned to you' : 'Unassigned',
        message: ticket.key
      })
    },
    onError: (error, _, context) => {
      // normy automatically handles rollback when optimisticData was provided
      context?.toast.update({
        style: 'failure',
        title: 'Assignment failed',
        message: formatErrorMessage(error)
      })
    }
  })
}
