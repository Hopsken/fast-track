import { StateCreator } from 'zustand'

import { JiraTicket } from '@/types'

import { SearchSlice } from './createSearchSlice'

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

    const navigationActions = {
      down: () => {
        if (searchResults.length === 0) return
        const newIndex = Math.min(selectedIndex + 1, searchResults.length - 1)
        set({ selectedIndex: newIndex })
      },
      up: () => {
        if (searchResults.length === 0) return
        const newIndex = Math.max(selectedIndex - 1, 0)
        set({ selectedIndex: newIndex })
      },
      enter: () => {
        if (searchResults.length === 0 || !searchResults[selectedIndex]) return
        onTicketClick?.(searchResults[selectedIndex])
      },
      escape: () => {
        set({ selectedIndex: 0 })
      }
    }

    const action = navigationActions[direction]
    if (action) {
      action()
    }
  },

  setSelectedIndex: (index: number) => {
    const { searchResults } = get()
    if (index >= 0 && index < searchResults.length) {
      set({ selectedIndex: index })
    }
  },

  resetSelection: () => {
    set({ selectedIndex: 0 })
  }
})
