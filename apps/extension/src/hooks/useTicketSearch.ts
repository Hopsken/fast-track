import { useMemo } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useDebounce, useMemoizedFn } from 'ahooks'
import { uniqBy } from 'lodash-es'

import { useCommandSearch } from '@/components/CommandRouter'
import { ticketService } from '@/services'
import { IssueSuggestion } from '@/services/ticket-service'
import { JiraTicket } from '@/types'
import { queryKeys } from '@/utils/queryKeys'
import { filterTicketsByQuery, rankTickets } from '@/utils/ticket-ranking'
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
  const queryClient = useQueryClient()
  const debouncedQuery = useDebounce(searchQuery, { wait: 200 })

  const projects = useMemo(
    () => normalizeProjects(options.projectKeys ?? []),
    [options.projectKeys]
  )
  const limit = options.limit ?? (projects.length > 0 ? 6 : 10)
  const enabled = (options.enabled ?? true) && Boolean(debouncedQuery)

  const getSuggestedTickets = useMemoizedFn((search: string) => {
    const suggestions = queryClient.getQueryData<IssueSuggestion>(
      queryKeys.tickets.suggestions
    )
    const allTickets = [
      ...(suggestions?.inProgress ?? []),
      ...(suggestions?.activeSprintTodo ?? []),
      ...(suggestions?.viewHistory ?? [])
    ]
    return filterTicketsByQuery(allTickets, search)
  })

  const placeholderData = useMemo(
    () => getSuggestedTickets(debouncedQuery),
    [debouncedQuery, getSuggestedTickets]
  )

  const searchTickets = useMemoizedFn(async (search: string) => {
    const tickets = await ticketService.searchTickets(search, {
      projectKeys: projects,
      limit
    })
    const suggested = getSuggestedTickets(search)
    const allTickets = uniqBy([...tickets, ...suggested], 'key')
    return rankTickets(allTickets, search)
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
    gcTime: minutes(5),
    placeholderData
  })
}
