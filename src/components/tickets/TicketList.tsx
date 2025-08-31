import { useEffect, useRef, useCallback } from 'react'
import { useHotkeys } from 'react-hotkeys-hook'
import { HiInformationCircle } from 'react-icons/hi'

import { JiraTicket, StorageKey, TicketViewRecord, useStorage } from '~/storage'
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

  const [viewHistory, setViewHistory] = useStorage(
    StorageKey.TicketViewHistory,
    []
  )
  const listRef = useRef<HTMLDivElement>(null)
  const itemRefs = useRef<(HTMLDivElement | null)[]>([])

  // Update itemRefs when search results change (no more setTickets sync needed!)
  useEffect(() => {
    itemRefs.current = new Array(searchResults.length).fill(null)
  }, [searchResults.length])

  // Handle ticket click with view history tracking
  const handleTicketClick = useCallback(
    async (ticket: JiraTicket) => {
      // Update view history
      const existingRecord = viewHistory.find(
        (record) => record.ticketKey === ticket.key
      )
      const updatedHistory = existingRecord
        ? viewHistory.map((record) =>
            record.ticketKey === ticket.key
              ? {
                  ...record,
                  viewCount: record.viewCount + 1,
                  lastViewed: new Date().toISOString()
                }
              : record
          )
        : [
            ...viewHistory,
            {
              ticketKey: ticket.key,
              viewCount: 1,
              lastViewed: new Date().toISOString()
            } as TicketViewRecord
          ]

      setViewHistory(updatedHistory.slice(0, 100)) // Keep only recent 100 records
      onTicketClick(ticket)
    },
    [viewHistory, setViewHistory, onTicketClick]
  )

  // Fallback copy function for older browsers
  const fallbackCopyTextToClipboard = useCallback((text: string) => {
    if (!text || typeof text !== 'string') {
      return
    }

    try {
      const textArea = document.createElement('textarea')
      textArea.value = text
      textArea.style.top = '0'
      textArea.style.left = '0'
      textArea.style.position = 'fixed'
      textArea.style.opacity = '0'
      textArea.style.pointerEvents = 'none'

      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()

      document.execCommand('copy')
      document.body.removeChild(textArea)
    } catch (error) {
      console.error('Error in fallback copy function:', error)
    }
  }, [])

  const copyTicketUrl = useCallback(
    async (ticket: JiraTicket) => {
      try {
        if (!ticket?.url) {
          return
        }

        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(ticket.url)
        } else {
          // Fallback for older browsers or when clipboard API is not available
          fallbackCopyTextToClipboard(ticket.url)
        }
      } catch (error) {
        console.error('Failed to copy ticket URL:', error)
        // Fallback for older browsers
        fallbackCopyTextToClipboard(ticket.url)
      }
    },
    [fallbackCopyTextToClipboard]
  )

  // Keyboard navigation using react-hotkeys-hook (fallback when search box doesn't have focus)
  useHotkeys(
    'ArrowDown',
    () => {
      navigate('down', handleTicketClick)
    },
    [navigate, handleTicketClick]
  )

  useHotkeys(
    'ArrowUp',
    () => {
      navigate('up', handleTicketClick)
    },
    [navigate, handleTicketClick]
  )

  useHotkeys(
    'Enter',
    () => {
      navigate('enter', handleTicketClick)
    },
    [navigate, handleTicketClick]
  )

  useHotkeys(
    'Escape',
    () => {
      navigate('escape', handleTicketClick)
    },
    [navigate, handleTicketClick]
  )

  useHotkeys(
    'ctrl+c,cmd+c',
    () => {
      if (searchResults.length === 0 || !searchResults[selectedIndex]) return
      copyTicketUrl(searchResults[selectedIndex])
    },
    [searchResults, selectedIndex, copyTicketUrl]
  )

  // Number shortcuts (1-9) for quick selection
  useHotkeys(
    '1,2,3,4,5,6,7,8,9',
    (e) => {
      const numKey = Number.parseInt(e.key)
      const targetIndex = numKey - 1
      if (searchResults.length === 0) return
      if (targetIndex < searchResults.length) {
        handleTicketClick(searchResults[targetIndex])
      }
    },
    [searchResults, handleTicketClick]
  )

  // Scroll selected item into view
  useEffect(() => {
    try {
      const selectedItem = itemRefs.current[selectedIndex]
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
            ref={(el) => {
              itemRefs.current[index] = el
            }}
            className="animate-in slide-in-from-right duration-300 ease-out"
            style={{ animationDelay: `${Math.min(index * 50, 500)}ms` }}>
            <TicketItem
              ticket={ticket}
              isSelected={index === selectedIndex}
              searchQuery={searchQuery}
              position={index + 1}
              onClick={() => handleTicketClick(ticket)}
              onCopyUrl={copyTicketUrl}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
