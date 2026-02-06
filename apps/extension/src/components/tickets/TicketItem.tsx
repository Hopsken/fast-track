import { CommandItem } from '@internal/ui/components/command'
import { useMemoizedFn } from 'ahooks'
import { useNavigate } from 'react-router-dom'

import { useIsOptionKeyPressed } from '@/hooks/useIsOptionKeyPressed'
import { getSuggestionService } from '@/services'
import { JiraIssue } from '@/types'
import { openJiraIssue } from '@/utils/open-jira-issue'
import {
  IssueTypeIcon,
  StatusBadge,
  // PriorityIcon,
  AssigneeAvatar,
  PriorityIcon
} from '~/components/ui/jira'
import { HighlightedText } from '~/utils/text-highlighting'

interface TicketItemProps {
  ticket: JiraIssue
  searchQuery?: string

  showAvatar?: boolean
  showPriority?: boolean
  showStatus?: boolean

  source: 'search' | 'suggestion'
}

export function TicketItem({
  ticket,
  searchQuery = '',
  showAvatar = true,
  showPriority = true,
  showStatus = true
}: TicketItemProps) {
  const navigate = useNavigate()
  const isOptionKeyPressed = useIsOptionKeyPressed()

  const onSelect = useMemoizedFn(() => {
    Promise.resolve().then(() =>
      getSuggestionService().recordProjectClick(ticket.projectKey)
    )

    if (isOptionKeyPressed) {
      openJiraIssue(ticket.key)
    } else {
      navigate(`/ticket/${ticket.key}`)
    }
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
