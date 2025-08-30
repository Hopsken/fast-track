import { HiCog6Tooth, HiClipboard } from 'react-icons/hi2'

import { JiraTicket } from '~/storage'
import { HighlightedText } from '~/utils/text-highlighting'

interface TicketItemProps {
  ticket: JiraTicket
  isSelected?: boolean
  searchQuery?: string
  position?: number
  onClick: () => void
  onCopyUrl?: (ticket: JiraTicket) => void
}

export function TicketItem({
  ticket,
  isSelected = false,
  searchQuery = '',
  position,
  onClick,
  onCopyUrl
}: TicketItemProps) {
  const statusColor = getStatusColor(ticket.status)

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    onClick()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onClick()
    }
  }

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    if (onCopyUrl) {
      onCopyUrl(ticket)
    }
  }

  return (
    <div
      className={`group transform cursor-pointer border-l-2 px-4 py-3 transition-all duration-200 ease-out hover:translate-x-1 ${
        isSelected
          ? 'translate-x-1 border-l-blue-400 bg-blue-50'
          : 'border-l-transparent hover:border-l-gray-200 hover:bg-gray-50 hover:shadow-sm'
      }`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onContextMenu={handleContextMenu}
      tabIndex={0}
      role="button"
      aria-label={`Open ticket ${ticket.key}: ${ticket.summary}`}>
      <div className="flex items-start gap-3">
        {/* Status indicator */}
        <div
          className={`h-2 w-2 rounded-full ${statusColor} mt-2 flex-shrink-0 transition-transform duration-200 group-hover:scale-125`}
        />

        {/* Main content */}
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center gap-2">
            <span className="rounded bg-gray-100 px-2 py-1 font-mono text-xs text-gray-500">
              <HighlightedText text={ticket.key} searchQuery={searchQuery} />
            </span>
            {ticket.assignee && (
              <span className="text-xs text-gray-400">
                @
                <HighlightedText
                  text={ticket.assignee || ''}
                  searchQuery={searchQuery}
                />
              </span>
            )}
          </div>
          <p className="truncate text-sm leading-snug font-medium text-gray-900">
            <HighlightedText text={ticket.summary} searchQuery={searchQuery} />
          </p>
          <div className="mt-1 flex items-center gap-2">
            <span className="text-xs text-gray-400 capitalize">
              {ticket.status}
            </span>
            {ticket.priority && (
              <>
                <span className="text-gray-300">•</span>
                <span className="text-xs text-gray-400 capitalize">
                  {ticket.priority}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Action hint */}
        <div className="flex flex-shrink-0 items-center gap-2">
          {position !== undefined && position <= 9 && (
            <span className="flex h-5 w-5 items-center justify-center rounded bg-gray-100 font-mono text-xs text-gray-400 transition-all duration-200 group-hover:scale-110 group-hover:bg-blue-100 group-hover:text-blue-600">
              {position}
            </span>
          )}
          <div className="flex translate-x-2 transform items-center gap-2 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100">
            <span className="text-xs text-gray-400 transition-colors duration-200">
              ↵
            </span>
            <HiClipboard
              className="h-3 w-3 text-gray-400 transition-all duration-200 hover:scale-110 hover:text-blue-500"
              title="Right-click to copy URL"
            />
          </div>
        </div>
      </div>
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

function getPriorityColor(priority?: string): string {
  if (!priority) return 'bg-gray-400'

  const priorityLower = priority.toLowerCase()
  if (priorityLower.includes('highest') || priorityLower.includes('critical')) {
    return 'bg-red-500'
  }
  if (priorityLower.includes('high')) {
    return 'bg-orange-500'
  }
  if (priorityLower.includes('medium')) {
    return 'bg-yellow-500'
  }
  if (priorityLower.includes('low')) {
    return 'bg-green-500'
  }
  return 'bg-gray-400'
}
