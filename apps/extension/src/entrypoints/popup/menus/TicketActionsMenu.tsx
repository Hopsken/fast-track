import { useMemo } from 'react'
import {
  CommandGroup,
  CommandList,
  CommandSeparator
} from '@internal/ui/components/command'
import {
  ChartNoAxesColumnIncreasing,
  Clipboard,
  MessageCircle,
  Route,
  UserPen,
  UserRoundMinus,
  UserRoundPlus
} from 'lucide-react'

import { Action, ActionCopyToClipboard, ActionPush } from '@/components/actions'
import { PrefetchProvider } from '@/components/PrefetchQuery'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import { useIssueEditMeta } from '@/hooks/useIssueEditMeta'
import { useIssuePriorities } from '@/hooks/useIssuePriorities'
import { useIssueTransitions } from '@/hooks/useIssueTransitions'
import { useMutationAssignMyself } from '@/hooks/useMutationAssignIssue'
import { JiraTicket } from '@/types'
import { generateBranchName, getIssueTitleLink } from '@/utils/jira/issues'

export function TicketActionsMenu({ ticket }: { ticket: JiraTicket }) {
  const formatted = useMemo(
    () => ({
      branchName: generateBranchName(ticket),
      issueTitleLink: getIssueTitleLink(ticket)
    }),
    [ticket]
  )

  return (
    <CommandList>
      <CommandGroup heading={`${ticket.key} - ${ticket.summary}`}>
        <ActionPush
          target={() => ({ path: '/ticket/assign', state: ticket })}
          icon={UserPen}
          title="Assign to..."
        />

        <AssignOrUnassignMySelf ticket={ticket} />

        <ActionPush
          target={() => ({ path: '/ticket/status', state: ticket })}
          icon={Route}
          title="Change status..."
        />

        <ActionPush
          target={() => ({ path: '/ticket/priority', state: ticket })}
          icon={ChartNoAxesColumnIncreasing}
          title="Change priority..."
        />
        <Action icon={MessageCircle} title="Add comment..." />
      </CommandGroup>

      <CommandSeparator />

      <CommandGroup heading="Misc">
        <ActionCopyToClipboard
          icon={Clipboard}
          content={ticket.key}
          title="Copy issue key"
          shortcut={{ modifiers: ['cmd'], key: '.' }}
        />
        <ActionCopyToClipboard
          icon={Clipboard}
          content={ticket.url}
          title="Copy issue link"
        />
        <ActionCopyToClipboard
          icon={Clipboard}
          content={ticket.summary}
          title="Copy issue title"
        />
        <ActionCopyToClipboard
          icon={Clipboard}
          content={formatted.issueTitleLink}
          title="Copy issue title as link"
        />
        <ActionCopyToClipboard
          icon={Clipboard}
          content={formatted.branchName}
          title="Copy git branch name"
        />
      </CommandGroup>

      <PrefetchProvider>
        <PrefetchActions ticket={ticket} />
      </PrefetchProvider>
    </CommandList>
  )
}

function AssignOrUnassignMySelf({ ticket }: { ticket: JiraTicket }) {
  const userInfo = useCurrentUser()
  const isAssignedByMe = userInfo?.email === ticket.assignee?.emailAddress

  const { mutateAsync: assignMyself } = useMutationAssignMyself()

  return isAssignedByMe ? (
    <Action
      icon={UserRoundMinus}
      title="Unassigned from me"
      onSelect={() => assignMyself({ ticket, assign: false })}
    />
  ) : (
    <Action
      icon={UserRoundPlus}
      title="Assign to me"
      onSelect={() => assignMyself({ ticket, assign: true })}
    />
  )
}

function PrefetchActions({ ticket }: { ticket: JiraTicket }) {
  useIssuePriorities()
  useIssueEditMeta(ticket)
  useIssueTransitions(ticket)

  return null
}
