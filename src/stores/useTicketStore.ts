import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { useShallow } from 'zustand/react/shallow'

import {
  createNavigationSlice,
  NavigationSlice
} from './slices/createNavigationSlice'
import { createSearchSlice, SearchSlice } from './slices/createSearchSlice'

// Combined store type
export type TicketStore = SearchSlice & NavigationSlice

// Create the combined store with devtools middleware
export const useTicketStore = create<TicketStore>()(
  devtools(
    (...a) => ({
      ...createSearchSlice(...a),
      ...createNavigationSlice(...a)
    }),
    {
      name: 'ticket-store'
    }
  )
)

// Auto-reset functionality is handled directly in the search slice

// Selectors for common use cases
export const useSearchQuery = () => useTicketStore((state) => state.searchQuery)
export const useSearchResults = () =>
  useTicketStore((state) => state.searchResults)
export const useSelectedIndex = () =>
  useTicketStore((state) => state.selectedIndex)
export const useSelectedTicket = () =>
  useTicketStore((state) => {
    const { searchResults, selectedIndex } = state
    return searchResults[selectedIndex] || null
  })
export const useSearchError = () => useTicketStore((state) => state.error)
export const useIsSearching = () =>
  useTicketStore((state) => state.searchState === 'searching')

// Action selectors
export const useSearchActions = () =>
  useTicketStore(
    useShallow((state) => ({
      setSearchQuery: state.setSearchQuery,
      setSearchResults: state.setSearchResults,
      setSearchError: state.setSearchError,
      setSearching: state.setSearching,
      clearSearch: state.clearSearch
    }))
  )

export const useNavigationActions = () =>
  useTicketStore(
    useShallow((state) => ({
      navigate: state.navigate,
      setSelectedIndex: state.setSelectedIndex,
      resetSelection: state.resetSelection
    }))
  )

// Export types
export type { NavigationDirection } from './slices/createNavigationSlice'
