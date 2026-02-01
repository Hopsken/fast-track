import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useDebounce, useMemoizedFn } from 'ahooks'

import { ticketService } from '@/services'
import { useCommandInput } from '@/stores/command/useCommandInputStore'
import { JiraTicket } from '@/types'
import { queryKeys } from '@/utils/queryKeys'
import { rankTickets } from '@/utils/ticket-ranking'
import { normalizeProjects } from '@/utils/ticket-search'
import { minutes } from '@/utils/time'

type TicketSearchOptions = {
  enabled?: boolean
  projectKeys?: string[]
  limit?: number
}

export const useSearchQuery = () => useCommandInput().search.trim()

export const useTicketSearch = (options: TicketSearchOptions = {}) => {
  const searchQuery = useSearchQuery()
  const debouncedQuery = useDebounce(searchQuery, {
    wait: 300,
    leading: false,
    trailing: true
  })

  const projects = useMemo(
    () => normalizeProjects(options.projectKeys ?? []),
    [options.projectKeys]
  )
  const limit = options.limit ?? (projects.length > 0 ? 6 : 10)
  const enabled = (options.enabled ?? true) && debouncedQuery.length > 1

  const searchTickets = useMemoizedFn(async (search: string) => {
    const tickets = await ticketService.searchTickets(search, {
      projectKeys: projects,
      limit
    })
    return rankTickets(tickets, search)
  })

  return useQuery<JiraTicket[]>({
    queryKey: queryKeys.tickets.search({
      query: debouncedQuery,
      projects,
      limit
    }),
    enabled,
    queryFn: async () => searchTickets(debouncedQuery),
    gcTime: minutes(5)
  })
}
