import { useMemo } from 'react'
import {
  CommandGroup,
  CommandList,
  CommandSeparator
} from '@internal/ui/components/command'
import {
  ChartNoAxesColumnIncreasing,
  Clipboard,
  Eye,
  EyeOff,
  MessageCircle,
  Route,
  UserRoundMinus,
  UserRoundPlus
} from 'lucide-react'

import { Action, ActionCopyToClipboard } from '@/components/actions'
import { JiraTicket } from '@/types'
import { generateBranchName, getIssueTitleLink } from '@/utils/jira/issues'

export function TicketActionsMenu({ ticket }: { ticket: JiraTicket }) {
  const isAssignedByMe = true
  const isWatching = true

  const formatted = useMemo(
    () => ({
      branchName: generateBranchName(ticket),
      issueTitleLink: getIssueTitleLink(ticket)
    }),
    [ticket]
  )

  return (
    <CommandList>
      <CommandGroup heading={ticket.key}>
        <Action icon={UserRoundPlus} title="Assign to..." />
        {isAssignedByMe ? (
          <Action icon={UserRoundMinus} title="Unassigned from me" />
        ) : null}
        <Action icon={Route} title="Change status..." />

        <Action icon={ChartNoAxesColumnIncreasing} title="Change priority..." />
        <Action icon={MessageCircle} title="Add comment..." />
        {isWatching ? (
          <Action icon={EyeOff} title="Stop watching" />
        ) : (
          <Action icon={Eye} title="Watch" />
        )}
      </CommandGroup>

      <CommandSeparator />

      <CommandGroup>
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
    </CommandList>
  )
}
