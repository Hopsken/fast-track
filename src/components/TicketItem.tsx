import { JiraTicket } from '~/storage'
import { HiExternalLink, HiClock, HiUser } from 'react-icons/hi'
import { formatDistanceToNow } from 'date-fns'

interface TicketItemProps {
  ticket: JiraTicket
  isSelected?: boolean
  onClick: () => void
}

export function TicketItem({ ticket, isSelected = false, onClick }: TicketItemProps) {
  const statusColor = getStatusColor(ticket.status)
  const priorityColor = getPriorityColor(ticket.priority)

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

  return (
    <div
      className={`group cursor-pointer p-3 rounded-lg border transition-all ${
        isSelected 
          ? 'bg-blue-50 border-blue-200 shadow-sm' 
          : 'bg-white border-gray-100 hover:bg-gray-50 hover:border-gray-200'
      }`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`Open ticket ${ticket.key}: ${ticket.summary}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          {/* Ticket Key and External Link */}
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-medium text-blue-600">
              {ticket.key}
            </span>
            <HiExternalLink className="w-3 h-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>

          {/* Summary */}
          <h3 className="text-sm font-medium text-gray-900 line-clamp-2 mb-2">
            {ticket.summary}
          </h3>

          {/* Metadata */}
          <div className="flex items-center gap-4 text-xs text-gray-500">
            {/* Status */}
            <div className="flex items-center gap-1">
              <div 
                className={`w-2 h-2 rounded-full ${statusColor}`} 
                title={ticket.status}
              />
              <span>{ticket.status}</span>
            </div>

            {/* Priority */}
            {ticket.priority && (
              <div className="flex items-center gap-1">
                <div 
                  className={`w-2 h-2 rounded-full ${priorityColor}`}
                  title={ticket.priority}
                />
                <span>{ticket.priority}</span>
              </div>
            )}

            {/* Assignee */}
            {ticket.assignee && (
              <div className="flex items-center gap-1">
                <HiUser className="w-3 h-3" />
                <span className="truncate max-w-20" title={ticket.assignee}>
                  {ticket.assignee}
                </span>
              </div>
            )}

            {/* Last viewed */}
            <div className="flex items-center gap-1 ml-auto">
              <HiClock className="w-3 h-3" />
              <span title={new Date(ticket.lastViewed).toLocaleString()}>
                {formatDistanceToNow(new Date(ticket.lastViewed), { addSuffix: true })}
              </span>
            </div>
          </div>
        </div>

        {/* View count badge */}
        {ticket.viewCount > 1 && (
          <div className="flex-shrink-0">
            <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded-full">
              {ticket.viewCount}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

function getStatusColor(status: string): string {
  const statusLower = status.toLowerCase()
  if (statusLower.includes('done') || statusLower.includes('resolved') || statusLower.includes('closed')) {
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