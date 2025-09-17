import { MouseEvent, KeyboardEvent } from 'react'

import { JiraTicket } from '@/types'
import {
  IssueTypeIcon,
  StatusBadge,
  // PriorityIcon,
  AssigneeAvatar
} from '~/components/ui/jira'
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
      className={`group flex cursor-pointer items-center gap-3 border-l-2 px-4 py-3 transition-all duration-200 ease-out hover:translate-x-1 ${
        isSelected
          ? 'border-l-blue-400 bg-blue-50'
          : 'border-l-transparent hover:border-l-gray-200 hover:bg-gray-50 hover:shadow-sm'
      }`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`Open ticket ${ticket.key}: ${ticket.summary}`}>
      {/* Issue Type Icon */}
      <IssueTypeIcon issueType={ticket.issueType} className="flex-shrink-0" />

      {/* Ticket Key */}
      <span className="flex-shrink-0 rounded bg-gray-100 px-2 py-1 font-mono text-xs text-gray-500">
        <HighlightedText text={ticket.key} searchQuery={searchQuery} />
      </span>

      {/* Summary */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-gray-900">
          <HighlightedText text={ticket.summary} searchQuery={searchQuery} />
        </p>
      </div>

      {/* Priority Icon */}
      {/* <PriorityIcon priority={ticket.priority} className="flex-shrink-0" /> */}

      {/* Status Badge */}
      <StatusBadge status={ticket.status} className="flex-shrink-0" />

      {/* Assignee Avatar */}
      <AssigneeAvatar assignee={ticket.assignee} className="flex-shrink-0" />
    </div>
  )
}
