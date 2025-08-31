import { useMemoizedFn } from 'ahooks'

import { debounceSearch } from '@/utils/search/debounce'
import { useStorage, StorageKey } from '~/storage'
import {
  useSearchQuery,
  useSearchResults,
  useSearchError,
  useIsSearching,
  useSearchActions
} from '~/stores/useTicketStore'

export function useTicketSearch() {
  // Get data from storage (source of truth for tickets data)
  const [tickets] = useStorage(StorageKey.TicketsData, [])

  const [viewHistory] = useStorage(StorageKey.TicketViewHistory, [])
  const [userEmail] = useStorage(StorageKey.JiraUserEmail, '')
  const [primaryPrefix] = useStorage(StorageKey.PrimaryIssueKeyPrefix, '')

  // Get state and actions from the store
  const searchQuery = useSearchQuery()
  const searchResults = useSearchResults()
  const error = useSearchError()
  const isSearching = useIsSearching()
  const actions = useSearchActions()


  // Debounced search function to reduce unnecessary computations
  const debouncedSearch = useMemoizedFn(
    debounceSearch((query: string) => {
      actions.search(
        query,
        tickets,
        viewHistory,
        userEmail,
        primaryPrefix
      )
    }, 300)
  )

  const handleSearch = useMemoizedFn((query: string) => {
    try {
      // Perform debounced search with unified action
      // This handles all state updates atomically
      debouncedSearch(query)
    } catch (error) {
      console.error('Error handling search:', error)
      actions.setError('Search failed')
    }
  })

  // Re-search when tickets data changes (removed - causes unnecessary searches)
  // Previous implementation would trigger searches on every ticket update
  // Now search only happens when user explicitly searches

  return {
    searchQuery,
    searchResults,
    handleSearch,
    error,
    isSearching
  }
}
