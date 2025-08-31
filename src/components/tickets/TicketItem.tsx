import { MouseEvent, KeyboardEvent } from 'react'

import { JiraTicket } from '~/storage'
import { HighlightedText } from '~/utils/text-highlighting'

interface TicketItemProps {
  ticket: JiraTicket
  isSelected?: boolean
  searchQuery?: string
  onClick: () => void
}

export function TicketItem({
  ticket,
  isSelected = false,
  searchQuery = '',
  onClick
}: TicketItemProps) {
  const statusColor = getStatusColor(ticket.status)

  const handleClick = (e: MouseEvent) => {
    e.preventDefault()
    onClick()
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onClick()
    }
  }

  return (
    <div
      className={`group flex cursor-pointer items-center border-l-2 px-4 py-3 transition-all duration-200 ease-out hover:translate-x-1 ${
        isSelected
          ? 'translate-x-1 border-l-blue-400 bg-blue-50'
          : 'border-l-transparent hover:border-l-gray-200 hover:bg-gray-50 hover:shadow-sm'
      }`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`Open ticket ${ticket.key}: ${ticket.summary}`}>
      {/* Ticket Key */}
      <span className="flex-shrink-0 rounded bg-gray-100 px-2 py-1 font-mono text-xs text-gray-500">
        <HighlightedText text={ticket.key} searchQuery={searchQuery} />
      </span>

      {/* Summary */}
      <div className="mx-3 min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-gray-900">
          <HighlightedText text={ticket.summary} searchQuery={searchQuery} />
        </p>
      </div>

      {/* Status */}
      <span
        className={`flex-shrink-0 rounded-full px-2 py-1 text-xs font-medium text-white ${statusColor.replace('bg-', 'bg-')}`}>
        {ticket.status}
      </span>

      {/* Assignee */}
      {ticket.assignee && (
        <span className="ml-3 flex-shrink-0 text-xs text-gray-400">
          @<HighlightedText text={ticket.assignee} searchQuery={searchQuery} />
        </span>
      )}
    </div>
  )
}

function getStatusColor(status: string): string {
  const statusLower = status.toLowerCase()
  if (
    statusLower.includes('done') ||
    statusLower.includes('resolved') ||
    statusLower.includes('closed')
  ) {
    return 'bg-green-400'
  }
  if (statusLower.includes('progress') || statusLower.includes('development')) {
    return 'bg-blue-400'
  }
  if (statusLower.includes('review') || statusLower.includes('testing')) {
    return 'bg-yellow-400'
  }
  if (statusLower.includes('blocked') || statusLower.includes('impediment')) {
    return 'bg-red-400'
  }
  return 'bg-gray-400'
}
