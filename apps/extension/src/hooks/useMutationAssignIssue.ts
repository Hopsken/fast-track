import { useMutation } from '@tanstack/react-query'
import { UserDetails } from 'jira.js/version3/models/userDetails'

import { ticketService } from '@/services'
import { JiraTicket } from '@/types'

import { useCurrentUser } from './useCurrentUser'

export function useMutationAssignIssue() {
  return useMutation({
    mutationFn: async (params: {
      ticket: JiraTicket
      assignee: UserDetails
    }) => {
      await ticketService.assignTicket(params.ticket.key, params.assignee)
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
    }
  })
}
