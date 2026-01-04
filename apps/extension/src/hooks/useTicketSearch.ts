import { useMemo } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useDebounce, useMemoizedFn } from 'ahooks'

import { useCommandSearch } from '@/components/CommandRouter'
import { ticketService } from '@/services'
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

export const useSearchQuery = () => useCommandSearch().trim()

export const useTicketSearch = (options: TicketSearchOptions = {}) => {
  const searchQuery = useSearchQuery()
  const debouncedQuery = useDebounce(searchQuery, { wait: 200 })

  const projects = useMemo(
    () => normalizeProjects(options.projectKeys ?? []),
    [options.projectKeys]
  )
  const limit = options.limit ?? (projects.length > 0 ? 6 : 10)
  const enabled = (options.enabled ?? true) && Boolean(debouncedQuery)

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
    staleTime: minutes(2),
    gcTime: minutes(5)
  })
}
