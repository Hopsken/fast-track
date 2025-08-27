import { useState, useEffect, useRef } from 'react'
import { JiraTicket, StorageKey, TicketViewRecord } from '~/storage'
import { useStorage } from '~/storage'
import { TicketItem } from './TicketItem'
import { HiInformationCircle } from 'react-icons/hi'

interface TicketListProps {
  tickets: JiraTicket[]
  searchQuery: string
  isLoading: boolean
  onTicketClick: (ticket: JiraTicket) => void
}

export function TicketList({ tickets, searchQuery, isLoading, onTicketClick }: TicketListProps) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [viewHistory, setViewHistory] = useStorage(StorageKey.TicketViewHistory, [])
  const listRef = useRef<HTMLDivElement>(null)
  const itemRefs = useRef<(HTMLDivElement | null)[]>([])

  // Reset selection when tickets change
  useEffect(() => {
    setSelectedIndex(0)
    itemRefs.current = new Array(tickets.length).fill(null)
  }, [tickets])

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (tickets.length === 0) return

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setSelectedIndex(prev => Math.min(prev + 1, tickets.length - 1))
          break
        case 'ArrowUp':
          e.preventDefault()
          setSelectedIndex(prev => Math.max(prev - 1, 0))
          break
        case 'Enter':
          e.preventDefault()
          if (tickets[selectedIndex]) {
            handleTicketClick(tickets[selectedIndex])
          }
          break
        case 'Escape':
          e.preventDefault()
          setSelectedIndex(0)
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [tickets, selectedIndex])

  // Scroll selected item into view
  useEffect(() => {
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
  }, [selectedIndex])

  const handleTicketClick = async (ticket: JiraTicket) => {
    // Update view history
    const existingRecord = viewHistory.find(record => record.ticketKey === ticket.key)
    const updatedHistory = existingRecord
      ? viewHistory.map(record => 
          record.ticketKey === ticket.key
            ? { ...record, viewCount: record.viewCount + 1, lastViewed: new Date().toISOString() }
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
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-2 text-gray-500">
          <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
          <span className="text-sm">Searching tickets...</span>
        </div>
      </div>
    )
  }

  if (tickets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <HiInformationCircle className="w-8 h-8 text-gray-400 mb-3" />
        <p className="text-sm text-gray-600 mb-2">
          {searchQuery ? 'No tickets found' : 'No tickets available'}
        </p>
        <p className="text-xs text-gray-500 max-w-64">
          {searchQuery 
            ? 'Try adjusting your search terms or browse some Jira boards to collect ticket data.'
            : 'Visit some Jira boards or issues to start collecting ticket data for quick search.'
          }
        </p>
      </div>
    )
  }

  return (
    <div ref={listRef} className="max-h-96 overflow-y-auto">
      <div className="space-y-2">
        {tickets.map((ticket, index) => (
          <div
            key={ticket.key}
            ref={el => itemRefs.current[index] = el}
          >
            <TicketItem
              ticket={ticket}
              isSelected={index === selectedIndex}
              onClick={() => handleTicketClick(ticket)}
            />
          </div>
        ))}
      </div>

      {/* Keyboard hint */}
      <div className="mt-3 pt-2 border-t border-gray-100">
        <p className="text-xs text-gray-500 text-center">
          Use ↑↓ arrow keys to navigate, Enter to open, Esc to reset
        </p>
      </div>
    </div>
  )
}