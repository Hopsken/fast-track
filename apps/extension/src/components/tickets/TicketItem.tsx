import { CommandItem } from '@internal/ui/components/command'
import { useMemoizedFn } from 'ahooks'

import { JiraTicket } from '@/types'
import {
  IssueTypeIcon,
  StatusBadge,
  // PriorityIcon,
  AssigneeAvatar,
  PriorityIcon
} from '~/components/ui/jira'
import { HighlightedText } from '~/utils/text-highlighting'

import { useCommandNavigate } from '../CommandRouter'

interface TicketItemProps {
  ticket: JiraTicket
  searchQuery?: string
}

export function TicketItem({ ticket, searchQuery = '' }: TicketItemProps) {
  const navigate = useCommandNavigate()

  const onSelect = useMemoizedFn(() => {
    navigate.push('/actions', ticket)
  })

  function renderPriority() {
    const priorityName = ticket.priority?.name?.toLowerCase()
    if (!priorityName || !ticket.priority) return null
    if (priorityName.includes('medium')) return null

    return <PriorityIcon priority={ticket.priority} />
  }

  return (
    <CommandItem
      tabIndex={0}
      role="button"
      onSelect={onSelect}
      aria-label={`Open ticket ${ticket.key}: ${ticket.summary}`}>
      <IssueTypeIcon issueType={ticket.issueType} />
      <span>
        <HighlightedText text={ticket.key} searchQuery={searchQuery} />
      </span>
      <div className="min-w-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap">
        <HighlightedText text={ticket.summary} searchQuery={searchQuery} />
      </div>
      {renderPriority()}
      <StatusBadge status={ticket.status} />
      <AssigneeAvatar assignee={ticket.assignee} />
    </CommandItem>
  )
}
