import { memo } from 'react'
import { useMemoizedFn } from 'ahooks'

import {
  ActionGroup,
  ActionItem,
  ActionList,
  ActionPanel,
  ActionPanelSlot,
  ActionSeparator
} from '@/common/commands'
import { PrefetchProvider } from '@/components/PrefetchQuery'
import { TicketBasicFields } from '@/components/tickets'
import {
  FooterShortcutHints,
  ShortcutHint
} from '@/entrypoints/popup/menus/MainMenu/FooterShortcutHints'
import { useIssueEditMeta } from '@/hooks/useIssueEditMeta'
import { useIssuePriorities } from '@/hooks/useIssuePriorities'
import { useIssueTransitions } from '@/hooks/useIssueTransitions'
import { useTicketDetails } from '@/hooks/useTicketDetails'
import { JiraIssueDetail, JiraIssue } from '@/types'
import { openJiraIssue } from '@/utils/open-jira-issue'

import { IssueActions } from './IssueActions'

const ISSUE_HINTS: ShortcutHint[] = [
  { keys: ['⌘', '⇧', 'S'], label: 'Set status' },
  { keys: ['⌘', '⇧', 'P'], label: 'Set priority' },
  { keys: ['⌘', '⇧', 'A'], label: 'Assign' }
]

export const IssueMenu = memo(function IssueMenu({
  ticketKey
}: {
  ticketKey: string
}) {
  const { isLoading, data: ticket } = useTicketDetails(ticketKey)

  return (
    <ActionPanel isLoading={isLoading}>
      {ticket ? <IssueMainMenuInner ticket={ticket} /> : null}

      <ActionPanelSlot>
        <FooterShortcutHints hints={ISSUE_HINTS} />
      </ActionPanelSlot>
    </ActionPanel>
  )
})

const IssueMainMenuInner = ({ ticket }: { ticket: JiraIssueDetail }) => {
  const onSelect = useMemoizedFn(() => {
    openJiraIssue(ticket.key)
  })

  return (
    <ActionList>
      <ActionGroup>
        <ActionItem value={ticket.key} onSelect={onSelect} className="mb-1">
          <TicketBasicFields ticket={ticket} />
        </ActionItem>
      </ActionGroup>

      <ActionSeparator />

      <IssueActions ticket={ticket} />

      <PrefetchProvider>
        <PrefetchActions ticket={ticket} />
      </PrefetchProvider>
    </ActionList>
  )
}

function PrefetchActions({ ticket }: { ticket: JiraIssue }) {
  useIssuePriorities()
  useIssueEditMeta(ticket.key)
  useIssueTransitions(ticket)

  return null
}
