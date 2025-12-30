import { useEffect, useMemo, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useMemoizedFn, useMount } from 'ahooks'
import { uniqBy } from 'lodash-es'

import { onMessage } from '@/lib/message'
import { mergeTickets } from '@/lib/ticket'
import { getSearchService } from '@/services/search-service'
import { getTicketService, IssueSuggestion } from '@/services/ticket-service'
import type { SearchScope } from '@/stores/slices/createSearchSlice'
import type { JiraTicket } from '@/types'
import {
  useSearchQuery,
  useSearchResults,
  useSearchError,
  useIsSearching,
  useSearchActions,
  useSearchScope,
  useTicketStore
} from '~/stores/useTicketStore'
import { getLogger } from '~/utils/logger'
import { queryKeys } from '~/utils/queryKeys'
import { rankTickets } from '~/utils/ticket-ranking'

const NOT_CONNECTED_MESSAGE =
  'Connect your Jira account in options to start searching.'

export function useTicketSearch() {
  // Get state and actions from the store
  const searchQuery = useSearchQuery()
  const searchResults = useSearchResults()
  const searchScope = useSearchScope()
  const error = useSearchError()
  const isSearching = useIsSearching()
  const actions = useSearchActions()
  const log = useMemo(() => getLogger('ticket-search'), [])
  const queryClient = useQueryClient()

  const [searchService] = useState(() => getSearchService())
  const [isAuthConfigured, setIsAuthConfigured] = useState(true)

  const getCachedTickets = useMemoizedFn(
    (query: string, scope: SearchScope) => {
      const normalizedQuery = query.trim()
      if (!normalizedQuery) {
        return []
      }

      const cachedSearchResults = queryClient.getQueryData(
        queryKeys.tickets.search(normalizedQuery, scope)
      ) as JiraTicket[] | undefined

      if (cachedSearchResults?.length) {
        return cachedSearchResults
      }

      const suggestions = queryClient.getQueryData<IssueSuggestion>(
        queryKeys.tickets.suggestions
      )

      const suggestionTickets = suggestions
        ? [
            ...suggestions.inProgress,
            ...suggestions.activeSprintTodo,
            ...suggestions.viewHistory
          ]
        : []

      const cachedSearchQueries = queryClient
        .getQueryCache()
        .findAll({
          predicate: (cachedQuery) =>
            Array.isArray(cachedQuery.queryKey) &&
            cachedQuery.queryKey[0] === 'tickets' &&
            cachedQuery.queryKey[1] === 'search'
        })
        .flatMap((cachedQuery) => {
          const data = cachedQuery.state.data
          return Array.isArray(data) ? (data as JiraTicket[]) : []
        })

      const mergedTickets = uniqBy(
        suggestionTickets.concat(cachedSearchQueries),
        'key'
      )

      const limit = scope === 'frequent' ? 5 : 30
      return rankTickets(mergedTickets, normalizedQuery, limit)
    }
  )

  const primeSearchFromCache = useMemoizedFn(
    (query: string, scope: SearchScope) => {
      const cachedTickets = getCachedTickets(query, scope)
      if (!cachedTickets.length) {
        return
      }

      actions.setSearchResults(cachedTickets)
      actions.setSearching()
      actions.setSearchError(undefined)
    }
  )

  // Simple search handler - just updates query, RxJS orchestrator handles the rest
  const handleSearch = useMemoizedFn((query: string) => {
    const trimmedQuery = query.trim()
    // Update search query - orchestrator will handle the actual search
    actions.setSearchQuery(query)
    primeSearchFromCache(trimmedQuery, 'frequent')
    searchService.onSearchInput({ query: trimmedQuery, scope: 'frequent' })
  })

  const handleShowMore = useMemoizedFn(() => {
    if (!searchQuery.trim()) {
      return
    }

    actions.setSearchScope('all')
    actions.setSearching()
    primeSearchFromCache(searchQuery, 'all')
    searchService.onSearchInput({ query: searchQuery, scope: 'all' })
  })

  useMount(() => {
    const unsubscribe = onMessage('onSearchResult', (payload) => {
      const { tickets, search, scope, error: searchError } = payload.data
      const state = useTicketStore.getState()
      // ignore search result if search doesn't match or user is selecting any ticket to avoid race conditions
      if (state.searchQuery !== search || state.searchScope !== scope) {
        return
      }

      queryClient.setQueryData(queryKeys.tickets.search(search, scope), tickets)

      if (searchError) {
        actions.setSearchResults(mergeTickets(state.searchResults, tickets))
        actions.setSearchError(searchError)
        return
      }

      actions.setSearchError(undefined)
      actions.setSearchResults(tickets)
    })

    searchService.initialize()

    return () => {
      unsubscribe()
    }
  })

  useMount(() => {
    const unsubscribe = onMessage('ticketsUpdated', async () => {
      const currentQuery = useTicketStore.getState().searchQuery
      const currentScope = useTicketStore.getState().searchScope
      await searchService.onSearchInput({
        query: currentQuery,
        scope: currentScope
      })
    })

    return () => {
      unsubscribe()
    }
  })

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const configured = await getTicketService().isConfigured()
        if (!configured) {
          actions.setSearchError(NOT_CONNECTED_MESSAGE)
          setIsAuthConfigured(false)
        } else {
          setIsAuthConfigured(true)
          actions.setSearchError(undefined)
        }
      } catch (err) {
        log.error('Failed to verify Jira connection', err)
        actions.setSearchError('Unable to verify Jira connection.')
      }
    }

    checkConnection()
  }, [actions, log])

  return {
    searchQuery,
    searchResults,
    searchScope,
    handleSearch,
    handleShowMore,
    error,
    isSearching,
    isAuthConfigured
  }
}
