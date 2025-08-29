import { JiraTicket } from '~/storage'
import { HiCog6Tooth } from 'react-icons/hi2'

interface TicketItemProps {
  ticket: JiraTicket
  isSelected?: boolean
  onClick: () => void
}

export function TicketItem({ ticket, isSelected = false, onClick }: TicketItemProps) {
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

  return (
    <div
      className={`group cursor-pointer px-3 py-2 transition-colors ${
        isSelected 
          ? 'bg-gray-100' 
          : 'hover:bg-gray-50'
      }`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`Open ticket ${ticket.key}: ${ticket.summary}`}
    >
      <div className="flex items-center gap-3">
        {/* Checkbox placeholder */}
        <div className="w-4 h-4 border border-gray-300 rounded-sm bg-white flex-shrink-0" />
        
        {/* Status indicator */}
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${statusColor} flex-shrink-0`} />
          <span className="text-sm text-gray-900 font-medium truncate">
            {ticket.summary}
          </span>
        </div>

        {/* Settings icon */}
        <div className="ml-auto flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
          <HiCog6Tooth className="w-4 h-4 text-gray-400 hover:text-gray-600" />
        </div>
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