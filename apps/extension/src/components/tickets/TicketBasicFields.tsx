import { JiraTicket } from '@/types'
import { IssueTypeIcon } from '~/components/ui/jira'

import { TicketMetadataChips } from './TicketMetadataChips'

interface TicketBasicFieldsProps {
  ticket: JiraTicket
  showKey?: boolean
}

export function TicketBasicFields({
  ticket,
  showKey = true
}: TicketBasicFieldsProps) {
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-2">
      <div className="flex items-center gap-2">
        <IssueTypeIcon issueType={ticket.issueType} />

        <div className="inline-flex min-w-0 flex-1">
          <span className="line-clamp-2 leading-tight">{ticket.summary}</span>
          {showKey && (
            <span className="text-muted-foreground ml-2 whitespace-nowrap">
              {ticket.key}
            </span>
          )}
        </div>
      </div>

      <TicketMetadataChips ticket={ticket} />
    </div>
  )
}
