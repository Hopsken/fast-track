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
  searchQuery?: string
  index: number
  onSelect: (index: number) => void
}

export function TicketItem({
  ticket,
  searchQuery = '',
  index,
  onSelect
}: TicketItemProps) {
  return (
    <CommandItem
      tabIndex={0}
      role="button"
      value={ticket.key}
      onSelect={() => onSelect(index)}
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
