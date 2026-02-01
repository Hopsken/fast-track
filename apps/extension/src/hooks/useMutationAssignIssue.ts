import { useMutation, useQueryClient } from '@tanstack/react-query'
import { UserDetails } from 'jira.js/version3/models/userDetails'

import { ticketService } from '@/services'
import { showToast } from '@/stores/command/useToastStore'
import { useCurrentUser } from '@/stores/useCurrentUser'
import { JiraUserInfo } from '@/types'
import { mapUserToAssignee } from '@/utils/jira/issues'
import { queryKeys } from '@/utils/queryKeys'
import { formatErrorMessage } from '~/utils/formatError'

export function useMutationAssignIssue() {
  return useMutation({
    mutationFn: async (params: {
      ticketKey: string
      assignee: UserDetails | null
    }) => {
      const updated = await ticketService.assignTicket(
        params.ticketKey,
        params.assignee
      )
      // Return updated ticket for normy to normalize
      return (
        updated ?? {
          __typename: 'JiraTicket' as const,
          key: params.ticketKey,
          assignee: params.assignee ? mapUserToAssignee(params.assignee) : null
        }
      )
    },
    onMutate: async ({ ticketKey, assignee }) => {
      const isUnassign = !assignee
      const displayName =
        assignee?.displayName ||
        assignee?.name ||
        assignee?.emailAddress ||
        'No assignee'

      const toast = showToast({
        style: 'loading',
        title: isUnassign ? 'Removing assignment...' : 'Assigning...',
        message: isUnassign ? ticketKey : `${ticketKey} -> ${displayName}`
      })

      // Return optimisticData for normy to apply immediately
      return {
        toast,
        displayName,
        isUnassign,
        optimisticData: {
          __typename: 'JiraTicket' as const,
          key: ticketKey,
          assignee: assignee ? mapUserToAssignee(assignee) : null,
          updated: new Date().toISOString()
        }
      }
    },
    onSuccess: (_, { ticketKey }, context) => {
      const displayName = context?.displayName ?? 'No assignee'
      const isUnassign = context?.isUnassign
      context?.toast.update({
        style: 'success',
        title: isUnassign ? 'Unassigned' : 'Assigned',
        message: isUnassign
          ? `${ticketKey} unassigned`
          : `${ticketKey} assigned to ${displayName}`
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
  const queryClient = useQueryClient()

  const mapCurrentUserToAssignee = (user: JiraUserInfo) =>
    mapUserToAssignee({
      displayName: user.name,
      name: user.name,
      emailAddress: user.email,
      avatarUrls: { '48x48': user.avatarUrl ?? '' }
    } as UserDetails)

  return useMutation({
    mutationFn: async (params: { ticketKey: string; assign: boolean }) => {
      if (!myself)
        throw new Error('useMutationAssignMyself: myself is required')

      const updated = await ticketService.assignTicket(
        params.ticketKey,
        params.assign ? myself : null
      )
      // Return updated ticket for normy to normalize
      return (
        updated ?? {
          __typename: 'JiraTicket' as const,
          key: params.ticketKey,
          assignee: params.assign ? mapCurrentUserToAssignee(myself) : null
        }
      )
    },
    onMutate: async ({ ticketKey, assign }) => {
      if (!myself)
        throw new Error('useMutationAssignMyself: myself is required')

      const toast = showToast({
        style: 'loading',
        title: assign ? 'Assigning to you...' : 'Removing assignment...',
        message: ticketKey
      })

      // Return optimisticData for normy to apply immediately
      return {
        toast,
        optimisticData: {
          __typename: 'JiraTicket' as const,
          key: ticketKey,
          assignee: assign ? mapCurrentUserToAssignee(myself) : null,
          updated: new Date().toISOString()
        }
      }
    },
    onSuccess: (_, { ticketKey, assign }, context) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.tickets.keys(ticketKey)
      })
      context?.toast.update({
        style: 'success',
        title: assign ? 'Assigned to you' : 'Unassigned',
        message: ticketKey
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
