import { useMemoizedFn, useMount } from 'ahooks'
import { useState } from 'react'

import { onMessage } from '@/lib/message'
import { mergeTickets } from '@/lib/ticket'
import { getSearchService } from '@/services/search-service'
import {
  useSearchQuery,
  useSearchResults,
  useSearchError,
  useIsSearching,
  useSearchActions,
  useTicketStore
} from '~/stores/useTicketStore'

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
      const { tickets, search } = payload.data
      const state = useTicketStore.getState()
      // ignore search result if search doesn't match or user is selecting any ticket to avoid race conditions
      if (state.searchQuery !== search) {
        return
      }

      if (state.selectedIndex > 0) {
        actions.setSearchResults(mergeTickets(state.searchResults, tickets))
      } else {
        actions.setSearchResults(tickets)
      }
    })

    searchService.initialize()

    return () => {
      unsubscribe()
    }
  })

  return {
    searchQuery,
    searchResults,
    handleSearch,
    error,
    isSearching
  }
}
