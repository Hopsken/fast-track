import { CommandItem } from '@internal/ui/components/command'
import { useMemoizedFn } from 'ahooks'

import { JiraTicket } from '@/types'
import {
  IssueTypeIcon,
  StatusBadge,
  // PriorityIcon,
  AssigneeAvatar
} from '~/components/ui/jira'
import { HighlightedText } from '~/utils/text-highlighting'

import { useCommandRouter } from '../CommandRouter'

interface TicketItemProps {
  ticket: JiraTicket
  searchQuery?: string
}

export function TicketItem({ ticket, searchQuery = '' }: TicketItemProps) {
  const { push } = useCommandRouter()

  const onSelect = useMemoizedFn(() => {
    push('/actions', ticket)
  })
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
      <StatusBadge status={ticket.status} />
      <AssigneeAvatar assignee={ticket.assignee} />
    </CommandItem>
  )
}
