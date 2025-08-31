import { StateCreator } from 'zustand'

import { JiraTicket } from '~/storage'

import { NavigationSlice } from './createNavigationSlice'
import { SearchSlice } from './search'

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

    // Auto-reset navigation selection when results change
    const { resetSelection } = get()
    if (resetSelection) {
      resetSelection()
    }
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
