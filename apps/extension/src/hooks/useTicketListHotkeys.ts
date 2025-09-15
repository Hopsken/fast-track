import { useMemoizedFn } from 'ahooks'
import { useHotkeys } from 'react-hotkeys-hook'

import { NavigationSlice } from '@/stores/slices/createNavigationSlice'
import type { JiraTicket } from '@/types'

interface UseTicketListHotkeysParams {
  searchResults: JiraTicket[]
  selectedIndex: number
  navigate: NavigationSlice['navigate']
  handleTicketClick: (ticket: JiraTicket) => void
}

/**
 * Custom hook to handle all keyboard shortcuts for the ticket list
 * Separates hotkey logic from the TicketList component for better separation of concerns
 */
export function useTicketListHotkeys({
  searchResults,
  selectedIndex,
  navigate,
  handleTicketClick
}: UseTicketListHotkeysParams): void {
  // Navigation: Arrow Down
  useHotkeys(
    'ArrowDown',
    () => {
      navigate('down', handleTicketClick)
    },
    [navigate, handleTicketClick]
  )

  // Navigation: Arrow Up
  useHotkeys(
    'ArrowUp',
    () => {
      navigate('up', handleTicketClick)
    },
    [navigate, handleTicketClick]
  )

  // Navigation: Enter (open selected ticket)
  useHotkeys(
    'Enter',
    () => {
      navigate('enter', handleTicketClick)
    },
    [navigate, handleTicketClick]
  )

  // Navigation: Escape
  useHotkeys(
    'Escape',
    () => {
      navigate('escape', handleTicketClick)
    },
    [navigate, handleTicketClick]
  )

  const copyTicketKey = useMemoizedFn(() => {
    if (searchResults.length === 0 || !searchResults[selectedIndex]) return
    navigator.clipboard.writeText(searchResults[selectedIndex].key)
  })

  // Copy selected ticket key to clipboard
  useHotkeys('ctrl+c,cmd+c', copyTicketKey)
}
