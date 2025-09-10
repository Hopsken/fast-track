import { useMemoizedFn } from 'ahooks'

import {
  useSearchQuery,
  useSearchResults,
  useSearchError,
  useIsSearching,
  useSearchActions
} from '~/stores/useTicketStore'

export function useTicketSearch() {
  // Get state and actions from the store
  const searchQuery = useSearchQuery()
  const searchResults = useSearchResults()
  const error = useSearchError()
  const isSearching = useIsSearching()
  const actions = useSearchActions()

  // Simple search handler - just updates query, RxJS orchestrator handles the rest
  const handleSearch = useMemoizedFn((query: string) => {
    try {
      // Update search query - orchestrator will handle the actual search
      actions.setSearchQuery(query)
    } catch (error) {
      console.error('Error handling search:', error)
      actions.setSearchError('Search failed')
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
