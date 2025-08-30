import { StateCreator } from 'zustand'

import { SearchSlice } from './createSearchSlice'

import { JiraTicket } from '~/storage'

export type NavigationDirection = 'up' | 'down' | 'enter' | 'escape'

export interface NavigationSlice {
  // State
  selectedIndex: number

  // Actions
  navigate: (
    direction: NavigationDirection,
    onTicketClick?: (ticket: JiraTicket) => void
  ) => void
  setSelectedIndex: (index: number) => void
  resetSelection: () => void
}

export const createNavigationSlice: StateCreator<
  SearchSlice & NavigationSlice,
  [],
  [],
  NavigationSlice
> = (set, get) => ({
  // Initial state
  selectedIndex: 0,

  // Actions
  navigate: (
    direction: NavigationDirection,
    onTicketClick?: (ticket: JiraTicket) => void
  ) => {
    const { selectedIndex, searchResults } = get()

    console.log('🎯 NavigationSlice - Navigate called:', {
      direction,
      selectedIndex,
      resultsCount: searchResults.length,
      hasOnTicketClick: !!onTicketClick
    })

    switch (direction) {
      case 'down':
        if (searchResults.length === 0) {
          console.log('🎯 NavigationSlice - Down: No search results available')
          return
        }
        const newDownIndex = Math.min(
          selectedIndex + 1,
          searchResults.length - 1
        )
        console.log(
          '🎯 NavigationSlice - Down: Moving from',
          selectedIndex,
          'to',
          newDownIndex
        )
        set({ selectedIndex: newDownIndex })
        break

      case 'up':
        if (searchResults.length === 0) {
          console.log('🎯 NavigationSlice - Up: No search results available')
          return
        }
        const newUpIndex = Math.max(selectedIndex - 1, 0)
        console.log(
          '🎯 NavigationSlice - Up: Moving from',
          selectedIndex,
          'to',
          newUpIndex
        )
        set({ selectedIndex: newUpIndex })
        break

      case 'enter':
        if (searchResults.length === 0 || !searchResults[selectedIndex]) {
          console.log(
            '🎯 NavigationSlice - Enter: No ticket at index',
            selectedIndex
          )
          return
        }
        console.log(
          '🎯 NavigationSlice - Enter: Clicking ticket at index',
          selectedIndex,
          searchResults[selectedIndex]
        )
        onTicketClick?.(searchResults[selectedIndex])
        break

      case 'escape':
        console.log('🎯 NavigationSlice - Escape: Resetting selection to 0')
        set({ selectedIndex: 0 })
        break
    }
  },

  setSelectedIndex: (index: number) => {
    const { searchResults } = get()
    if (index >= 0 && index < searchResults.length) {
      console.log('🎯 NavigationSlice - Setting selected index:', index)
      set({ selectedIndex: index })
    } else {
      console.warn(
        '🎯 NavigationSlice - Invalid index:',
        index,
        'for results count:',
        searchResults.length
      )
    }
  },

  resetSelection: () => {
    console.log('🎯 NavigationSlice - Resetting selection to 0')
    set({ selectedIndex: 0 })
  }
})
