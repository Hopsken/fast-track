import { useMemoizedFn } from 'ahooks'
import { useCallback } from 'react'

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

  const [searchHistory, setSearchHistory] = useStorage(
    StorageKey.SearchHistory,
    []
  )
  const [viewHistory] = useStorage(StorageKey.TicketViewHistory, [])
  const [userEmail] = useStorage(StorageKey.JiraUserEmail, '')
  const [primaryPrefix] = useStorage(StorageKey.PrimaryIssueKeyPrefix, '')

  // Get state and actions from the store
  const searchQuery = useSearchQuery()
  const searchResults = useSearchResults()
  const error = useSearchError()
  const isSearching = useIsSearching()
  const actions = useSearchActions()

  // Enhanced addToSearchHistory that updates both store and storage
  const addToSearchHistory = useCallback(
    async (query: string) => {
      try {
        if (!query.trim()) return

        const newHistory = [
          query,
          ...searchHistory.filter((h) => h !== query)
        ].slice(0, 10)
        setSearchHistory(newHistory)
      } catch (error) {
        console.error('Error adding to search history:', error)
      }
    },
    [searchHistory, setSearchHistory]
  )

  const clearSearchHistory = useCallback(async () => {
    try {
      setSearchHistory([])
    } catch (error) {
      console.error('Error clearing search history:', error)
    }
  }, [setSearchHistory])

  // Debounced search function to reduce unnecessary computations
  const debouncedSearch = useMemoizedFn(
    debounceSearch((query: string) => {
      actions.search(
        query,
        tickets,
        searchHistory,
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

      // Add to search history if query is not empty
      if (query.trim()) {
        addToSearchHistory(query.trim())
      }
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
    searchHistory,
    handleSearch,
    clearSearchHistory,
    error,
    isSearching
  }
}
