import { useEffect, useRef } from 'react'
import { CommandEmpty, CommandList } from '@internal/ui/components/command'
import { useMemoizedFn } from 'ahooks'
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
  showNotConfiguredNotice?: boolean
  onOpenOptionsPage?: () => void
}

export function TicketList({
  showNotConfiguredNotice,
  onOpenOptionsPage,
  onTicketClick
}: TicketListProps) {
  // Get state and actions from the unified store
  const selectedIndex = useSelectedIndex()
  const searchQuery = useSearchQuery()
  const searchResults = useSearchResults() // Use search results from store instead of props
  const isSearching = useIsSearching()
  const { navigate } = useNavigationActions()

  const listRef = useRef<HTMLDivElement>(null)
  let emptyMessage = 'Tickets will appear here once collected from Jira'

  if (isSearching) {
    emptyMessage = 'Searching tickets...'
  } else if (searchQuery) {
    emptyMessage = 'No tickets found'
  }

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

  if (showNotConfiguredNotice) {
    return (
      <CommandEmpty asChild>
        <div>
          <HiInformationCircle aria-hidden="true" />
          <div>
            <p>Connect to Jira to search.</p>
            <p>Connect your Jira account in settings to start searching.</p>
          </div>
          {onOpenOptionsPage ? (
            <button type="button" onClick={onOpenOptionsPage}>
              Open settings
            </button>
          ) : null}
        </div>
      </CommandEmpty>
    )
  }

  if (searchResults.length === 0) {
    return <CommandEmpty>{emptyMessage}</CommandEmpty>
  }

  return (
    <CommandList ref={listRef} aria-label="Ticket search results">
      {searchResults.map((ticket, index) => (
        <TicketItem
          key={ticket.key}
          ticket={ticket}
          isSelected={index === selectedIndex}
          searchQuery={searchQuery}
          onClick={() => handleTicketClick(ticket)}
          index={index}
        />
      ))}
    </CommandList>
  )
}
