import { useMutation } from '@tanstack/react-query'

import { ticketService } from '@/services'
import { JiraPriority, JiraTicket } from '@/types'

export function useMutationUpdatePriority() {
  return useMutation({
    mutationFn: async (params: {
      ticket: JiraTicket
      priority: JiraPriority
    }) => {
      await ticketService.updateTicketPriority(params.ticket, params.priority)
    }
  })
}
