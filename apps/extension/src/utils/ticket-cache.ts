import { QueryClient, QueryKey } from '@tanstack/react-query'

import { IssueSuggestion } from '@/services/ticket-service'
import { IssueDetail, JiraTicket } from '@/types'
import { queryKeys } from '@/utils/queryKeys'

type TicketCacheSnapshot = {
  detailKey: QueryKey
  detail: IssueDetail | null | undefined
  suggestions: IssueSuggestion | undefined
}

type TicketUpdate = Partial<JiraTicket>

const updateTicketInList = (
  tickets: JiraTicket[] | undefined,
  ticketKey: string,
  update: TicketUpdate
) => {
  if (!tickets) return tickets
  return tickets.map((ticket) =>
    ticket.key === ticketKey ? { ...ticket, ...update } : ticket
  )
}

export const updateTicketCaches = (
  queryClient: QueryClient,
  ticketKey: string,
  update: TicketUpdate
): TicketCacheSnapshot => {
  const detailKey = queryKeys.tickets.detail(ticketKey)
  const detail = queryClient.getQueryData<IssueDetail | null>(detailKey)
  const suggestions = queryClient.getQueryData<IssueSuggestion>(
    queryKeys.tickets.suggestions
  )
  const updatedAt = update.updated ?? new Date().toISOString()
  const updateWithTimestamp = {
    ...update,
    updated: updatedAt
  }

  queryClient.setQueryData<IssueDetail | null>(detailKey, (current) => {
    if (!current) return current
    return { ...current, ...updateWithTimestamp }
  })

  queryClient.setQueryData<IssueSuggestion>(
    queryKeys.tickets.suggestions,
    (current) => {
      if (!current) return current

      const existingTicket = current.tickets[ticketKey]
      if (!existingTicket) return current

      return {
        ...current,
        tickets: {
          ...current.tickets,
          [ticketKey]: {
            ...existingTicket,
            ...updateWithTimestamp
          }
        }
      }
    }
  )

  return {
    detailKey,
    detail,
    suggestions
  }
}

export const restoreTicketCaches = (
  queryClient: QueryClient,
  snapshot?: TicketCacheSnapshot
) => {
  if (!snapshot) return

  queryClient.setQueryData(snapshot.detailKey, snapshot.detail)
  queryClient.setQueryData(queryKeys.tickets.suggestions, snapshot.suggestions)
}

export const invalidateTicketCaches = (
  queryClient: QueryClient,
  ticketKey: string
) => {
  queryClient.invalidateQueries({
    queryKey: queryKeys.tickets.detail(ticketKey)
  })
  queryClient.invalidateQueries({
    queryKey: queryKeys.tickets.suggestions
  })
}
