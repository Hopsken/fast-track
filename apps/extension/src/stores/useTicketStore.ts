import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { useShallow } from 'zustand/react/shallow'

import { createSearchSlice, SearchSlice } from './slices/createSearchSlice'

// Combined store type
export type TicketStore = SearchSlice
// Create the combined store with devtools middleware
export const useTicketStore = create<TicketStore>()(
  devtools(
    (...a) => ({
      ...createSearchSlice(...a)
    }),
    {
      name: 'ticket-store'
    }
  )
)

// Selectors for common use cases
export const useSearchQuery = () => useTicketStore((state) => state.searchQuery)
export const useSearchResults = () =>
  useTicketStore((state) => state.searchResults)
export const useSearchScope = () => useTicketStore((state) => state.searchScope)
export const useSearchError = () => useTicketStore((state) => state.error)
export const useIsSearching = () =>
  useTicketStore((state) => state.searchState === 'searching')

// Action selectors
export const useSearchActions = () =>
  useTicketStore(
    useShallow((state) => ({
      setSearchQuery: state.setSearchQuery,
      setSearchScope: state.setSearchScope,
      setSearchResults: state.setSearchResults,
      setSearchError: state.setSearchError,
      setSearching: state.setSearching,
      clearSearch: state.clearSearch
    }))
  )
