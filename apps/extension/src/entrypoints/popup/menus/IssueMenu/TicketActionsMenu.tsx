import { Fragment, useMemo } from 'react'
import { CommandGroup, CommandSeparator } from '@internal/ui/components/command'
import {
  ChartNoAxesColumnIncreasing,
  Clipboard,
  GitBranch,
  Link2,
  Route,
  UserPen,
  UserRoundPlus
} from 'lucide-react'

import { AssigneeAvatar } from '@/components'
import { Action, ActionCopyToClipboard, ActionPush } from '@/components/actions'
import { useMutationAssignMyself } from '@/hooks/useMutationAssignIssue'
import { useCurrentUser } from '@/stores/useCurrentUser'
import { useUserPreferences } from '@/stores/useUserPreferences'
import { JiraTicket } from '@/types'
import { generateBranchName, getIssueTitleLink } from '@/utils/jira/issues'

import { CommandRoutes } from '../../routes'

import { useCurrentTicket } from './useCurrentTicket'

export const TicketActionsMenu = () => {
  const ticket = useCurrentTicket()
  const [preferences] = useUserPreferences()

  const formatted = useMemo(
    () => ({
      branchName: generateBranchName(ticket, preferences.branchNameFormat),
      issueTitleLink: getIssueTitleLink(ticket)
    }),
    [preferences.branchNameFormat, ticket]
  )

  return (
    <Fragment>
      <CommandGroup heading="General">
        <ActionPush
          value="assign-to"
          target={CommandRoutes.IssueDetails(ticket.key)}
          icon={UserPen}
          title="Assign to..."
          shortcut={{
            macOS: { modifiers: ['cmd', 'shift'], key: 'a' },
            Windows: { modifiers: ['alt', 'shift'], key: 'a' }
          }}
        />

        <AssignOrUnassignMySelf ticket={ticket} />

        <ActionPush
          value="change-status"
          target={CommandRoutes.IssueStatus(ticket.key)}
          icon={Route}
          title="Change status..."
          shortcut={{
            macOS: { modifiers: ['cmd', 'shift'], key: 's' },
            Windows: { modifiers: ['alt', 'shift'], key: 's' }
          }}
        />

        <ActionPush
          value="change-priority"
          target={CommandRoutes.IssuePriority(ticket.key)}
          icon={ChartNoAxesColumnIncreasing}
          title="Change priority..."
          shortcut={{
            macOS: { modifiers: ['cmd', 'shift'], key: 'p' },
            Windows: { modifiers: ['alt', 'shift'], key: 'p' }
          }}
        />
      </CommandGroup>

      <CommandSeparator />

      <CommandGroup heading="Misc">
        <ActionCopyToClipboard
          value="copy-issue-key"
          icon={Clipboard}
          content={ticket.key}
          title="Copy issue key"
          shortcut={{
            macOS: { modifiers: ['cmd', 'shift'], key: 'k' },
            Windows: { modifiers: ['alt', 'shift'], key: 'k' }
          }}
        />
        <ActionCopyToClipboard
          value="copy-issue-link"
          icon={Link2}
          content={ticket.url}
          title="Copy issue link"
          shortcut={{
            macOS: { modifiers: ['cmd', 'shift'], key: 'l' },
            Windows: { modifiers: ['alt', 'shift'], key: 'l' }
          }}
        />
        <ActionCopyToClipboard
          value="copy-issue-title"
          icon={Clipboard}
          content={ticket.summary}
          title="Copy issue title"
          shortcut={{
            macOS: { modifiers: ['cmd', 'shift'], key: 't' },
            Windows: { modifiers: ['alt', 'shift'], key: 't' }
          }}
        />
        <ActionCopyToClipboard
          value="copy-issue-key-and-title"
          icon={Clipboard}
          content={`${ticket.key}: ${ticket.summary}`}
          title="Copy issue key and title"
          shortcut={{
            macOS: { modifiers: ['cmd', 'shift'], key: 'c' },
            Windows: { modifiers: ['alt', 'shift'], key: 'c' }
          }}
        />
        <ActionCopyToClipboard
          value="copy-issue-title-link"
          icon={Link2}
          content={formatted.issueTitleLink}
          title="Copy issue title as link"
          shortcut={{
            macOS: { modifiers: ['cmd', 'opt'], key: 'l' },
            Windows: { modifiers: ['ctrl', 'alt'], key: 'l' }
          }}
        />
        <ActionCopyToClipboard
          value="copy-git-branch-name"
          icon={GitBranch}
          content={formatted.branchName}
          title="Copy git branch name"
          shortcut={{
            macOS: { modifiers: ['cmd', 'shift'], key: 'b' },
            Windows: { modifiers: ['alt', 'shift'], key: 'b' }
          }}
        />
      </CommandGroup>
    </Fragment>
  )
}

function AssignOrUnassignMySelf({ ticket }: { ticket: JiraTicket }) {
  const userInfo = useCurrentUser()
  const isAssignedByMe = userInfo?.email === ticket.assignee?.emailAddress

  const { mutateAsync: assignMyself } = useMutationAssignMyself()

  return isAssignedByMe ? (
    <Action
      value="unassign-myself"
      prefix={<AssigneeAvatar size="1rem" assignee={ticket.assignee} />}
      title="Unassigned from me"
      onSelect={() => assignMyself({ ticketKey: ticket.key, assign: false })}
      shortcut={{
        macOS: { modifiers: ['cmd', 'shift'], key: 'u' },
        Windows: { modifiers: ['alt', 'shift'], key: 'u' }
      }}
    />
  ) : (
    <Action
      value="assign-myself"
      icon={UserRoundPlus}
      title="Assign to me"
      onSelect={() => assignMyself({ ticketKey: ticket.key, assign: true })}
      shortcut={{
        macOS: { modifiers: ['cmd', 'shift'], key: 'm' },
        Windows: { modifiers: ['alt', 'shift'], key: 'm' }
      }}
    />
  )
}
