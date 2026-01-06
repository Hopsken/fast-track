import { Badge } from '@internal/ui/components/badge'
import { AlertCircle, ArrowUpCircle, Tag } from 'lucide-react'

import { IssueDetail, JiraTicket } from '@/types'

export function TicketMetadataChips({
  ticket
}: {
  ticket: JiraTicket | IssueDetail
}) {
  const labels = (ticket as IssueDetail).labels || []

  return (
    <div className="mb-2 flex flex-wrap items-center gap-2">
      {/* Status */}
      <Badge
        variant="outline"
        className="flex h-6 items-center gap-1.5 px-2 py-0.5 font-normal">
        <div
          className={`h-2 w-2 rounded-full ${getStatusDotColor(
            ticket.status.statusCategory.colorName
          )}`}
        />
        {ticket.status.name}
      </Badge>

      {/* Priority */}
      {ticket.priority && (
        <Badge
          variant="secondary"
          className="bg-accent/50 flex h-6 items-center gap-1.5 px-2 py-0.5 font-normal">
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

      {/* Type */}
      <Badge
        variant="secondary"
        className="bg-accent/50 flex h-6 items-center gap-1.5 px-2 py-0.5 font-normal">
        {ticket.issueType.iconUrl ? (
          <img
            src={ticket.issueType.iconUrl}
            className="h-3.5 w-3.5"
            alt={ticket.issueType.name}
          />
        ) : (
          <AlertCircle className="h-3.5 w-3.5" />
        )}
        {ticket.issueType.name}
      </Badge>

      {/* Labels */}
      {labels.length > 0 && (
        <div className="ml-1 flex items-center gap-1">
          <Tag className="text-muted-foreground h-3.5 w-3.5 opacity-70" />
          {labels.slice(0, 3).map((label) => (
            <Badge
              key={label}
              variant="outline"
              className="border-border/60 text-muted-foreground h-5 px-1.5 py-0 text-[10px] font-normal">
              {label}
            </Badge>
          ))}
          {labels.length > 3 && (
            <span className="text-muted-foreground text-[10px]">
              +{labels.length - 3}
            </span>
          )}
        </div>
      )}
    </div>
  )
}

function getStatusDotColor(colorName?: string) {
  switch (colorName) {
    case 'blue-gray':
      return 'bg-slate-400'
    case 'yellow':
      return 'bg-amber-400'
    case 'green':
      return 'bg-emerald-400'
    case 'red':
      return 'bg-rose-400'
    default:
      return 'bg-slate-400'
  }
}
