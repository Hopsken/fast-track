import { memo } from 'react'
import { useMemoizedFn } from 'ahooks'

import {
  CommandGroup,
  CommandItem,
  CommandList,
  CommandSeparator
} from '@/common/commands'
import { PrefetchProvider } from '@/components/PrefetchQuery'
import { TicketBasicFields } from '@/components/tickets'
import { useIssueEditMeta } from '@/hooks/useIssueEditMeta'
import { useIssuePriorities } from '@/hooks/useIssuePriorities'
import { useIssueTransitions } from '@/hooks/useIssueTransitions'
import { useTicketDetails } from '@/hooks/useTicketDetails'
import { JiraIssueDetail, JiraIssue } from '@/types'
import { openJiraIssue } from '@/utils/open-jira-issue'

export const IssueMainMenu = memo(function IssueMainMenu({
  ticketKey
}: {
  ticketKey: string
}) {
  const { data: ticket } = useTicketDetails(ticketKey)

  if (!ticket) {
    return null
  }

  return <IssueMainMenuInner ticket={ticket} />
})

const IssueMainMenuInner = ({ ticket }: { ticket: JiraIssueDetail }) => {
  const onSelect = useMemoizedFn(() => {
    openJiraIssue(ticket.key)
  })

  return (
    <CommandList>
      <CommandGroup>
        <CommandItem value={ticket.key} onSelect={onSelect} className="mb-1">
          <TicketBasicFields ticket={ticket} />
        </CommandItem>
      </CommandGroup>

      <CommandSeparator />

      <PrefetchProvider>
        <PrefetchActions ticket={ticket} />
      </PrefetchProvider>
    </CommandList>
  )
}

function PrefetchActions({ ticket }: { ticket: JiraIssue }) {
  useIssuePriorities()
  useIssueEditMeta(ticket.key)
  useIssueTransitions(ticket)

  return null
}
