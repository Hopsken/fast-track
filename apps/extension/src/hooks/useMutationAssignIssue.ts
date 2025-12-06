import { useMutation } from '@tanstack/react-query'
import { UserDetails } from 'jira.js/version3/models/userDetails'

import { ticketService } from '@/services'
import { JiraTicket } from '@/types'
import { showToast } from '~/stores/useToastStore'
import { formatErrorMessage } from '~/utils/formatError'

import { useCurrentUser } from './useCurrentUser'

export function useMutationAssignIssue() {
  return useMutation({
    mutationFn: async (params: {
      ticket: JiraTicket
      assignee: UserDetails
    }) => {
      await ticketService.assignTicket(params.ticket.key, params.assignee)
    },
    onMutate: ({ ticket, assignee }) => {
      const displayName =
        assignee.displayName || assignee.name || assignee.emailAddress || 'User'

      const toast = showToast({
        style: 'loading',
        title: 'Assigning...',
        message: `${ticket.key} -> ${displayName}`
      })

      return { toast, displayName }
    },
    onSuccess: (_, { ticket }, context) => {
      const displayName = context?.displayName ?? 'User'
      context?.toast.update({
        style: 'success',
        title: 'Assigned',
        message: `${ticket.key} assigned to ${displayName}`
      })
    },
    onError: (error, { ticket }, context) => {
      context?.toast.update({
        style: 'failure',
        title: 'Assign failed',
        message: formatErrorMessage(error)
      })
    }
  })
}

export function useMutationAssignMyself() {
  const myself = useCurrentUser()

  return useMutation({
    mutationFn: async (params: { ticket: JiraTicket; assign: boolean }) => {
      if (!myself)
        throw new Error('useMutationAssignMyself: myself is required')

      await ticketService.assignTicket(
        params.ticket.key,
        params.assign ? myself : null
      )
    },
    onMutate: ({ ticket, assign }) => {
      const toast = showToast({
        style: 'loading',
        title: assign ? 'Assigning to you...' : 'Removing assignment...',
        message: ticket.key
      })

      return { toast }
    },
    onSuccess: (_, { ticket, assign }, context) => {
      context?.toast.update({
        style: 'success',
        title: assign ? 'Assigned to you' : 'Unassigned',
        message: ticket.key
      })
    },
    onError: (error, { ticket }, context) => {
      context?.toast.update({
        style: 'failure',
        title: 'Assignment failed',
        message: formatErrorMessage(error)
      })
    }
  })
}
