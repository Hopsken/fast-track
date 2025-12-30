import { StateCreator } from 'zustand'

import { JiraTicket } from '@/types'

export type SearchState = 'idle' | 'searching' | 'success' | 'error'
export type SearchScope = 'frequent' | 'all'

// Search slice interface
export interface SearchSlice {
  // State
  searchQuery: string
  searchResults: JiraTicket[]
  searchScope: SearchScope
  error?: string
  searchState: SearchState

  // Simple state management actions - no complex search logic
  setSearchQuery: (query: string) => void
  setSearchScope: (scope: SearchScope) => void
  setSearchResults: (results: JiraTicket[]) => void
  setSearchError: (error?: string) => void
  setSearching: () => void
  clearSearch: () => void
}

export const createSearchSlice: StateCreator<
  SearchSlice,
  [],
  [],
  SearchSlice
> = (set) => ({
  // Initial state
  searchQuery: '',
  searchResults: [],
  searchScope: 'frequent',
  error: undefined,
  searchState: 'idle',

  // Simple state management actions - no complex search logic
  setSearchQuery: (query: string) => {
    const trimmedQuery = query.trim()
    set({
      searchQuery: trimmedQuery,
      searchScope: 'frequent',
      searchState: trimmedQuery ? 'searching' : 'idle'
    })
  },

  setSearchScope: (scope: SearchScope) => {
    set({ searchScope: scope })
  },

  setSearchResults: (results: JiraTicket[]) => {
    set({
      searchResults: results,
      searchState: 'success'
    })
  },

  setSearchError: (error?: string) => {
    set({
      error,
      searchState: error ? 'error' : 'idle'
    })
  },

  setSearching: () => {
    set({ searchState: 'searching' })
  },

  clearSearch: () => {
    set({
      searchQuery: '',
      searchResults: [],
      searchScope: 'frequent',
      error: undefined,
      searchState: 'idle'
    })
  }
})
