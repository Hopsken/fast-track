import { useMemoizedFn } from 'ahooks'
import { useEffect, useRef } from 'react'
import { HiInformationCircle } from 'react-icons/hi'

import { JiraTicket } from '@/types'
import { useTicketListHotkeys } from '~/hooks/useTicketListHotkeys'
import {
  useSelectedIndex,
  useSearchResults,
  useNavigationActions,
  useSearchQuery,
  useIsSearching
} from '~/stores/useTicketStore'

import { TicketItem } from './TicketItem'

interface TicketListProps {
  onTicketClick: (ticket: JiraTicket) => void
}

export function TicketList({ onTicketClick }: TicketListProps) {
  // Get state and actions from the unified store
  const selectedIndex = useSelectedIndex()
  const searchQuery = useSearchQuery()
  const searchResults = useSearchResults() // Use search results from store instead of props
  const isSearching = useIsSearching()
  const { navigate } = useNavigationActions()

  const listRef = useRef<HTMLDivElement>(null)

  // Handle ticket click with view history tracking
  const handleTicketClick = useMemoizedFn(async (ticket: JiraTicket) => {
    onTicketClick(ticket)
  })

  // Handle all keyboard shortcuts for the ticket list
  useTicketListHotkeys({
    searchResults,
    selectedIndex,
    navigate,
    handleTicketClick
  })

  // Scroll selected item into view using data attributes
  useEffect(() => {
    try {
      const selectedItem = listRef.current?.querySelector(
        `[data-ticket-index="${selectedIndex}"]`
      ) as HTMLElement
      if (selectedItem && listRef.current) {
        const container = listRef.current
        const containerRect = container.getBoundingClientRect()
        const itemRect = selectedItem.getBoundingClientRect()

        if (itemRect.bottom > containerRect.bottom) {
          selectedItem.scrollIntoView({ block: 'end', behavior: 'smooth' })
        } else if (itemRect.top < containerRect.top) {
          selectedItem.scrollIntoView({ block: 'start', behavior: 'smooth' })
        }
      }
    } catch (error) {
      console.warn('Error scrolling to selected item:', error)
    }
  }, [selectedIndex])

  if (searchResults.length === 0) {
    if (isSearching) {
      return (
        <div className="animate-in fade-in flex flex-col items-center justify-center px-6 py-12 text-center duration-300">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-blue-50">
            <svg
              className="h-6 w-6 animate-spin text-blue-500"
              fill="none"
              viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <p className="animate-in slide-in-from-bottom-2 mb-1 text-sm font-medium text-gray-700 delay-100 duration-500">
            Searching tickets...
          </p>
          <p className="animate-in slide-in-from-bottom-2 text-xs text-gray-500 delay-200 duration-500">
            Please wait while we find your tickets
          </p>
        </div>
      )
    }

    return (
      <div className="animate-in fade-in flex flex-col items-center justify-center px-6 py-12 text-center duration-300">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 transition-all duration-300 hover:scale-105 hover:bg-gray-200">
          <HiInformationCircle className="h-6 w-6 text-gray-400 transition-colors duration-200" />
        </div>
        <p className="animate-in slide-in-from-bottom-2 mb-1 text-sm font-medium text-gray-700 delay-100 duration-500">
          {searchQuery ? 'No tickets found' : 'No tickets yet'}
        </p>
        <p className="animate-in slide-in-from-bottom-2 text-xs text-gray-500 delay-200 duration-500">
          {searchQuery
            ? 'Try adjusting your search query'
            : 'Tickets will appear here once collected from Jira'}
        </p>
      </div>
    )
  }

  return (
    <div ref={listRef} className="max-h-96 overflow-y-auto">
      <div className="space-y-0">
        {searchResults.map((ticket, index) => (
          <div
            key={ticket.key}
            data-ticket-index={index}
            className="animate-in slide-in-from-right duration-300 ease-out"
            style={{ animationDelay: `${Math.min(index * 50, 500)}ms` }}>
            <TicketItem
              ticket={ticket}
              isSelected={index === selectedIndex}
              searchQuery={searchQuery}
              onClick={() => handleTicketClick(ticket)}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
