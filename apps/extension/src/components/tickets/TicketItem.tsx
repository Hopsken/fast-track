import { CommandItem } from '@internal/ui/components/command'
import { useMemoizedFn } from 'ahooks'

import { projectService } from '@/services'
import { trackEvent } from '@/services/analytics'
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

  showAvatar?: boolean
  showPriority?: boolean
  showStatus?: boolean

  source: 'search' | 'suggestion'
}

export function TicketItem({
  ticket,
  source,
  searchQuery = '',
  showAvatar = true,
  showPriority = true,
  showStatus = true
}: TicketItemProps) {
  const navigate = useCommandNavigate()

  const onSelect = useMemoizedFn(() => {
    navigate.push('/actions', ticket)

    projectService.recordProjectClick(ticket.projectKey)

    trackEvent('select-ticket', { source })
  })

  function renderPriority() {
    if (!showPriority) return null

    const priorityName = ticket.priority?.name?.toLowerCase()
    if (!priorityName || !ticket.priority) return null
    if (priorityName.includes('medium')) return null

    return <PriorityIcon priority={ticket.priority} />
  }

  return (
    <CommandItem
      key={ticket.key}
      value={ticket.key}
      tabIndex={0}
      role="button"
      onSelect={onSelect}
      aria-label={`Open ticket ${ticket.key}: ${ticket.summary}`}>
      <IssueTypeIcon issueType={ticket.issueType} />

      <div className="inline-flex min-w-0 flex-1">
        <HighlightedText
          className="overflow-hidden text-ellipsis whitespace-nowrap"
          text={ticket.summary}
          searchQuery={searchQuery}
        />
        <HighlightedText
          text={ticket.key}
          searchQuery={searchQuery}
          className="ml-2 whitespace-nowrap text-gray-500"
        />
      </div>

      {renderPriority()}
      {showStatus && <StatusBadge status={ticket.status} />}
      {showAvatar && <AssigneeAvatar assignee={ticket.assignee} />}
    </CommandItem>
  )
}
