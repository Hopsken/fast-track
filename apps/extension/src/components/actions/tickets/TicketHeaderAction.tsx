import { CommandItem } from '@internal/ui/components/command'

import { IssueDetail, JiraTicket } from '@/types'
import { IssueTypeIcon } from '~/components/ui/jira'

import { TicketMetadataChips } from './TicketMetadataChips'

interface TicketHeaderActionProps {
  ticket: JiraTicket
  issueDetail?: IssueDetail | null
  onSelect: () => void
}

export function TicketHeaderAction({
  ticket,
  issueDetail,
  onSelect
}: TicketHeaderActionProps) {
  const displayTicket = issueDetail || ticket

  return (
    <CommandItem
      value={ticket.key}
      onSelect={onSelect}
      className="flex items-start justify-between py-3">
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex items-center gap-2">
          <IssueTypeIcon issueType={ticket.issueType} />

          <div className="inline-flex min-w-0 flex-1">
            <span className="line-clamp-2 font-semibold leading-tight">
              {ticket.summary}
            </span>
            <span className="text-muted-foreground ml-2 whitespace-nowrap font-mono text-xs opacity-70">
              {ticket.key}
            </span>
          </div>
        </div>

        <TicketMetadataChips ticket={displayTicket} />
      </div>
    </CommandItem>
  )
}
