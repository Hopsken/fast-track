import { useCallback, useEffect } from 'react'

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

        console.log('🔍 useTicketSearch - Adding to search history:', query)
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
      console.log('🔍 useTicketSearch - Clearing search history')
      setSearchHistory([])
    } catch (error) {
      console.error('Error clearing search history:', error)
    }
  }, [setSearchHistory])

  const handleSearch = useCallback(
    (query: string) => {
      try {
        console.log('🔍 useTicketSearch - Handling search:', query)

        // Update search query in store
        actions.setSearchQuery(query)
        actions.setError(undefined)

        // Perform search with current data
        actions.performSearch(
          query,
          tickets,
          searchHistory,
          viewHistory,
          userEmail,
          primaryPrefix
        )

        // Add to search history if query is not empty
        if (query.trim()) {
          addToSearchHistory(query.trim())
        }
      } catch (error) {
        console.error('Error handling search:', error)
        actions.setError('Search failed')
      }
    },
    [
      actions,
      tickets,
      searchHistory,
      viewHistory,
      userEmail,
      primaryPrefix,
      addToSearchHistory
    ]
  )

  useEffect(() => {
    console.log('🔍 useTicketSearch - Tickets data changed:', tickets)
    handleSearch(searchQuery)
  }, [tickets])

  return {
    searchQuery,
    searchResults,
    searchHistory,
    handleSearch,
    clearSearchHistory,
    setSearchQuery: actions.setSearchQuery,
    error,
    isSearching
  }
}
