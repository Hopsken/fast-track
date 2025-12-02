import { MouseEvent, KeyboardEvent } from 'react'
import { CommandItem } from '@internal/ui/components/command'

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
  index?: number
}

export function TicketItem({
  ticket,
  isSelected = false,
  searchQuery = '',
  onClick,
  index
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
    <CommandItem
      data-ticket-index={index}
      data-selected={isSelected ? 'true' : 'false'}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`Open ticket ${ticket.key}: ${ticket.summary}`}>
      <IssueTypeIcon issueType={ticket.issueType} />
      <span>
        <HighlightedText text={ticket.key} searchQuery={searchQuery} />
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <HighlightedText text={ticket.summary} searchQuery={searchQuery} />
      </div>
      <StatusBadge status={ticket.status} />
      <AssigneeAvatar assignee={ticket.assignee} />
    </CommandItem>
  )
}
