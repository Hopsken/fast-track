import { StateCreator } from 'zustand'

import {
  createValidationError,
  createDataError,
  getErrorMessage,
  isRecoverableError
} from '@/utils/search/errors'
import { JiraTicket, TicketViewRecord } from '~/storage'

import { NavigationSlice } from './createNavigationSlice'
import {
  SearchSlice,
  SearchContext,
  SEARCH_LIMITS,
  SEARCH_HISTORY_LIMIT,
  getRecentTickets,
  searchTickets,
  createFallbackResults
} from './search'

export type { SearchState, SearchSlice } from './search'

export const createSearchSlice: StateCreator<
  SearchSlice & NavigationSlice,
  [],
  [],
  SearchSlice
> = (set, get) => ({
  // Initial state
  searchQuery: '',
  searchResults: [],
  searchHistory: [],
  error: undefined,
  searchState: 'idle',
  searchRequestId: 0,

  // Actions
  search: (
    query: string,
    tickets: JiraTicket[],
    searchHistory: string[],
    viewHistory: TicketViewRecord[],
    userEmail: string,
    primaryPrefix: string
  ) => {
    const currentRequestId = get().searchRequestId + 1

    // Set initial state atomically
    set({
      searchQuery: query,
      error: undefined,
      searchState: 'searching',
      searchRequestId: currentRequestId
    })

    try {
      // Validate input data
      if (!Array.isArray(tickets)) {
        throw createDataError('tickets must be an array')
      }

      const searchContext: SearchContext = {
        viewHistory,
        userEmail,
        primaryPrefix,
        searchHistory
      }

      let results: JiraTicket[]

      if (!query.trim()) {
        // Handle empty query - show recent tickets
        results = getRecentTickets(tickets, searchContext)
      } else {
        // Validate search query
        if (query.length > SEARCH_LIMITS.maxQueryLength) {
          throw createValidationError('query', 'too long (max 200 characters)')
        }
        // Perform actual search
        results = searchTickets(query, tickets, searchContext)
      }

      // Only update if this is still the current request
      const state = get()
      if (state.searchRequestId === currentRequestId) {
        set({ searchResults: results, searchState: 'success' })

        // Auto-reset navigation selection
        const { resetSelection } = state
        if (resetSelection) resetSelection()
      }
    } catch (error) {
      console.error('Search error:', error)
      const errorMessage = getErrorMessage(error as Error)
      const recoverable = isRecoverableError(error as Error)

      // Only update if this is still the current request
      const state = get()
      if (state.searchRequestId === currentRequestId) {
        set({ error: errorMessage, searchState: 'error' })

        // Fallback: return basic filtered results for non-empty queries (only for recoverable errors)
        if (recoverable && Array.isArray(tickets) && query.trim()) {
          const fallbackResults = createFallbackResults(query, tickets)
          set({ searchResults: fallbackResults })
        } else {
          set({ searchResults: [] })
        }

        // Auto-reset navigation selection
        const { resetSelection } = state
        if (resetSelection) resetSelection()
      }
    }
  },

  addToSearchHistory: (query: string, currentHistory: string[]): string[] => {
    if (!query.trim()) return currentHistory
    return [query, ...currentHistory.filter((h) => h !== query)].slice(0, SEARCH_HISTORY_LIMIT)
  },

  clearSearch: () => {
    set({
      searchQuery: '',
      searchResults: [],
      error: undefined,
      searchState: 'idle'
    })
  },

  setError: (error?: string) => {
    set({ error })
  }
})