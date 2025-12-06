import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'

import { getTicketService } from '@/services/ticket-service'
import { JiraTicket } from '@/types'
import { queryKeys } from '@/utils/queryKeys'

export function useIssueEditMeta(issue: JiraTicket) {
  const [ticketService] = useState(() => getTicketService())

  return useQuery({
    queryKey: queryKeys.issue.editMeta(issue),
    queryFn: async () => {
      return ticketService.getIssueEditMeta(issue)
    }
  })
}
