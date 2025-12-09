import { useMemo } from 'react'
import {
  CommandGroup,
  CommandList,
  CommandSeparator
} from '@internal/ui/components/command'
import {
  ChartNoAxesColumnIncreasing,
  Clipboard,
  GitBranch,
  Link2,
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
          shortcut={{
            macOS: { modifiers: ['cmd', 'shift'], key: 'a' },
            Windows: { modifiers: ['alt', 'shift'], key: 'a' }
          }}
        />

        <AssignOrUnassignMySelf ticket={ticket} />

        <ActionPush
          target={() => ({ path: '/ticket/status', state: ticket })}
          icon={Route}
          title="Change status..."
          shortcut={{
            macOS: { modifiers: ['cmd', 'shift'], key: 's' },
            Windows: { modifiers: ['alt', 'shift'], key: 's' }
          }}
        />

        <ActionPush
          target={() => ({ path: '/ticket/priority', state: ticket })}
          icon={ChartNoAxesColumnIncreasing}
          title="Change priority..."
          shortcut={{
            macOS: { modifiers: ['cmd', 'shift'], key: 'p' },
            Windows: { modifiers: ['alt', 'shift'], key: 'p' }
          }}
        />
        <Action
          icon={MessageCircle}
          title="Add comment..."
          shortcut={{
            macOS: { modifiers: ['cmd', 'shift'], key: 'e' },
            Windows: { modifiers: ['alt', 'shift'], key: 'e' }
          }}
        />
      </CommandGroup>

      <CommandSeparator />

      <CommandGroup heading="Misc">
        <ActionCopyToClipboard
          icon={Clipboard}
          content={ticket.key}
          title="Copy issue key"
          shortcut={{
            macOS: { modifiers: ['cmd', 'shift'], key: 'k' },
            Windows: { modifiers: ['alt', 'shift'], key: 'k' }
          }}
        />
        <ActionCopyToClipboard
          icon={Link2}
          content={ticket.url}
          title="Copy issue link"
          shortcut={{
            macOS: { modifiers: ['cmd', 'shift'], key: 'l' },
            Windows: { modifiers: ['alt', 'shift'], key: 'l' }
          }}
        />
        <ActionCopyToClipboard
          icon={Clipboard}
          content={ticket.summary}
          title="Copy issue title"
          shortcut={{
            macOS: { modifiers: ['cmd', 'shift'], key: 't' },
            Windows: { modifiers: ['alt', 'shift'], key: 't' }
          }}
        />
        <ActionCopyToClipboard
          icon={Clipboard}
          content={`${ticket.key}: ${ticket.summary}`}
          title="Copy issue key and title"
          shortcut={{
            macOS: { modifiers: ['cmd', 'shift'], key: 'c' },
            Windows: { modifiers: ['alt', 'shift'], key: 'c' }
          }}
        />
        <ActionCopyToClipboard
          icon={Link2}
          content={formatted.issueTitleLink}
          title="Copy issue title as link"
          shortcut={{
            macOS: { modifiers: ['cmd', 'opt'], key: 'l' },
            Windows: { modifiers: ['ctrl', 'alt'], key: 'l' }
          }}
        />
        <ActionCopyToClipboard
          icon={GitBranch}
          content={formatted.branchName}
          title="Copy git branch name"
          shortcut={{
            macOS: { modifiers: ['cmd', 'shift'], key: 'b' },
            Windows: { modifiers: ['alt', 'shift'], key: 'b' }
          }}
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
      shortcut={{
        macOS: { modifiers: ['cmd', 'shift'], key: 'u' },
        Windows: { modifiers: ['alt', 'shift'], key: 'u' }
      }}
    />
  ) : (
    <Action
      icon={UserRoundPlus}
      title="Assign to me"
      onSelect={() => assignMyself({ ticket, assign: true })}
      shortcut={{
        macOS: { modifiers: ['cmd', 'shift'], key: 'm' },
        Windows: { modifiers: ['alt', 'shift'], key: 'm' }
      }}
    />
  )
}

function PrefetchActions({ ticket }: { ticket: JiraTicket }) {
  useIssuePriorities()
  useIssueEditMeta(ticket)
  useIssueTransitions(ticket)

  return null
}
