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

import { Action } from '@/components/actions'
import { JiraTicket } from '@/types'

export function TicketActionsMenu({ ticket }: { ticket: JiraTicket }) {
  const isAssignedByMe = true
  const isWatching = true
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
        <Action
          icon={Clipboard}
          title="Copy issue key"
          shortcut={{ modifiers: ['cmd'], key: '.' }}
        />
        <Action icon={Clipboard} title="Copy issue link" />
        <Action icon={Clipboard} title="Copy issue title" />
        <Action icon={Clipboard} title="Copy issue title as link" />
        <Action icon={Clipboard} title="Copy git branch name" />
      </CommandGroup>
    </CommandList>
  )
}
