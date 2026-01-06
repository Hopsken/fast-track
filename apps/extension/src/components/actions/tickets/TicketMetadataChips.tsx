import { Badge } from '@internal/ui/components/badge'
import { ArrowUpCircle, Tag } from 'lucide-react'

import { AssigneeAvatar } from '@/components/ui'
import { IssueDetail, JiraTicket } from '@/types'
import { getStatusDotColor } from '@/utils/ticket-status'

export function TicketMetadataChips({
  ticket
}: {
  ticket: JiraTicket | IssueDetail
}) {
  const labels = (ticket as IssueDetail).labels || []

  return (
    <div className="flex flex-wrap items-center gap-2 text-xs">
      {/* Status */}
      <Badge variant="outline">
        <div
          className={`h-2 w-2 rounded-full ${getStatusDotColor(ticket.status)}`}
        />
        {ticket.status.name}
      </Badge>

      {/* Priority */}
      {ticket.priority && (
        <Badge variant="outline">
          {ticket.priority.iconUrl ? (
            <img
              src={ticket.priority.iconUrl}
              className="h-3.5 w-3.5"
              alt={ticket.priority.name}
            />
          ) : (
            <ArrowUpCircle className="h-3.5 w-3.5" />
          )}
          {ticket.priority.name}
        </Badge>
      )}

      {ticket.assignee && (
        // <Badge variant={'outline'}>
        <AssigneeAvatar
          size="1.2rem"
          className="rounded-full border"
          assignee={ticket.assignee}
        />
        // </Badge>
      )}

      {/* Labels */}
      {labels.length > 0 && (
        <div className="ml-1 flex items-center gap-1">
          <Tag className="text-muted-foreground h-3.5 w-3.5 opacity-70" />
          {labels.slice(0, 1).map((label) => (
            <Badge
              key={label}
              variant="outline"
              className="border-border/60 text-muted-foreground h-5 px-1.5 py-0 text-[10px] font-normal">
              {label}
            </Badge>
          ))}
          {labels.length > 1 && (
            <span className="text-muted-foreground text-[10px]">
              +{labels.length - 1}
            </span>
          )}
        </div>
      )}
    </div>
  )
}
