import { useMutation, useQueryClient } from '@tanstack/react-query'
import { UserDetails } from 'jira.js/version3/models/userDetails'

import { ticketService } from '@/services'
import { useCurrentUser } from '@/stores/useCurrentUser'
import { JiraTicket, JiraUserInfo } from '@/types'
import { mapUserToAssignee } from '@/utils/jira/issues'
import { queryKeys } from '@/utils/queryKeys'
import {
  invalidateTicketCaches,
  restoreTicketCaches,
  updateTicketCaches
} from '@/utils/ticket-cache'
import { showToast } from '~/stores/useToastStore'
import { formatErrorMessage } from '~/utils/formatError'

export function useMutationAssignIssue() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (params: {
      ticket: JiraTicket
      assignee: UserDetails | null
    }) => {
      await ticketService.assignTicket(params.ticket.key, params.assignee)
    },
    onMutate: async ({ ticket, assignee }) => {
      await queryClient.cancelQueries({
        queryKey: queryKeys.tickets.suggestions
      })
      await queryClient.cancelQueries({
        queryKey: queryKeys.tickets.detail(ticket.key)
      })

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

      const snapshot = updateTicketCaches(queryClient, ticket.key, {
        assignee: assignee ? mapUserToAssignee(assignee) : null
      })

      return { toast, displayName, isUnassign, snapshot }
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
      invalidateTicketCaches(queryClient, ticket.key)
    },
    onError: (error, _, context) => {
      restoreTicketCaches(queryClient, context?.snapshot)
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
    mutationFn: async (params: { ticket: JiraTicket; assign: boolean }) => {
      if (!myself)
        throw new Error('useMutationAssignMyself: myself is required')

      await ticketService.assignTicket(
        params.ticket.key,
        params.assign ? myself : null
      )
    },
    onMutate: async ({ ticket, assign }) => {
      if (!myself)
        throw new Error('useMutationAssignMyself: myself is required')

      await queryClient.cancelQueries({
        queryKey: queryKeys.tickets.suggestions
      })
      await queryClient.cancelQueries({
        queryKey: queryKeys.tickets.detail(ticket.key)
      })

      const toast = showToast({
        style: 'loading',
        title: assign ? 'Assigning to you...' : 'Removing assignment...',
        message: ticket.key
      })

      const snapshot = updateTicketCaches(queryClient, ticket.key, {
        assignee: assign ? mapCurrentUserToAssignee(myself) : null
      })

      return { toast, snapshot }
    },
    onSuccess: (_, { ticket, assign }, context) => {
      context?.toast.update({
        style: 'success',
        title: assign ? 'Assigned to you' : 'Unassigned',
        message: ticket.key
      })
      invalidateTicketCaches(queryClient, ticket.key)
    },
    onError: (error, _, context) => {
      restoreTicketCaches(queryClient, context?.snapshot)
      context?.toast.update({
        style: 'failure',
        title: 'Assignment failed',
        message: formatErrorMessage(error)
      })
    }
  })
}
