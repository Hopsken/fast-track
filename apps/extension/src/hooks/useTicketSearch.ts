import { useMemoizedFn, useMount } from 'ahooks'
import { useEffect, useState } from 'react'

import { onMessage } from '@/lib/message'
import { mergeTickets } from '@/lib/ticket'
import { getSearchService } from '@/services/search-service'
import { getTicketService } from '@/services/ticket-service'
import {
  useSearchQuery,
  useSearchResults,
  useSearchError,
  useIsSearching,
  useSearchActions,
  useTicketStore
} from '~/stores/useTicketStore'

const NOT_CONNECTED_MESSAGE =
  'Connect your Jira account in options to start searching.'

export function useTicketSearch() {
  // Get state and actions from the store
  const searchQuery = useSearchQuery()
  const searchResults = useSearchResults()
  const error = useSearchError()
  const isSearching = useIsSearching()
  const actions = useSearchActions()

  const [searchService] = useState(() => getSearchService())

  // Simple search handler - just updates query, RxJS orchestrator handles the rest
  const handleSearch = useMemoizedFn((query: string) => {
    // Update search query - orchestrator will handle the actual search
    actions.setSearchQuery(query)
    searchService.onSearchInput(query)
  })

  useMount(() => {
    const unsubscribe = onMessage('onSearchResult', (payload) => {
      const { tickets, search, error: searchError } = payload.data
      const state = useTicketStore.getState()
      // ignore search result if search doesn't match or user is selecting any ticket to avoid race conditions
      if (state.searchQuery !== search) {
        return
      }

      if (searchError) {
        actions.setSearchResults(mergeTickets(state.searchResults, tickets))
        actions.setSearchError(searchError)
        return
      }

      actions.setSearchError(undefined)
      actions.setSearchResults(mergeTickets(state.searchResults, tickets))
    })

    searchService.initialize()

    return () => {
      unsubscribe()
    }
  })

  useMount(() => {
    const unsubscribe = onMessage('ticketsUpdated', async () => {
      const currentQuery = useTicketStore.getState().searchQuery
      await searchService.onSearchInput(currentQuery)
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
        } else {
          actions.setSearchError(undefined)
        }
      } catch (err) {
        console.error('Failed to verify Jira connection', err)
        actions.setSearchError('Unable to verify Jira connection.')
      }
    }

    checkConnection()
  }, [actions])

  return {
    searchQuery,
    searchResults,
    handleSearch,
    error,
    isSearching
  }
}
