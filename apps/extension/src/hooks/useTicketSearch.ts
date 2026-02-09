import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useDebounce, useMemoizedFn } from 'ahooks'

import { getJiraService } from '@/services'
import { JiraIssue } from '@/types'
import { queryKeys } from '@/utils/queryKeys'
import { rankTickets } from '@/utils/ticket-ranking'
import { normalizeProjects } from '@/utils/ticket-search'
import { minutes } from '@/utils/time'

type TicketSearchOptions = {
  searchQuery?: string
  enabled?: boolean
  projectKeys?: string[]
  limit?: number
}

export const useTicketSearch = (options: TicketSearchOptions = {}) => {
  const searchQuery = options.searchQuery ?? ''
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
    const tickets = await getJiraService().issues.searchIssuesByText(search, {
      projectKeys: projects,
      limit
    })
    return rankTickets(tickets, search)
  })

  return useQuery<JiraIssue[]>({
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
