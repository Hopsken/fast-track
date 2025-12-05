import { StateCreator } from 'zustand'

import { JiraTicket } from '@/types'

export type SearchState = 'idle' | 'searching' | 'success' | 'error'

// Search slice interface
export interface SearchSlice {
  // State
  searchQuery: string
  searchResults: JiraTicket[]
  error?: string
  searchState: SearchState

  // Simple state management actions - no complex search logic
  setSearchQuery: (query: string) => void
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
  error: undefined,
  searchState: 'idle',

  // Simple state management actions - no complex search logic
  setSearchQuery: (query: string) => {
    set({
      searchQuery: query,
      searchState: query.trim() ? 'searching' : 'idle'
    })
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
      error: undefined,
      searchState: 'idle'
    })
  }
})
