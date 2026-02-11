import { useMemo } from 'react'
import {
  ChartNoAxesColumnIncreasing,
  Clipboard,
  GitBranch,
  Link2,
  Route,
  UserPen,
  UserRoundPlus
} from 'lucide-react'

import {
  Action,
  ActionCopyToClipboard,
  ActionGroup,
  ActionPush,
  ActionSeparator
} from '@/common/commands'
import { AssigneeAvatar } from '@/components'
import { useMutationAssignMyself } from '@/hooks/useMutationAssignIssue'
import { HotkeysScopeProvider } from '@/lib/hotkeys'
import { useCurrentUser } from '@/stores/useCurrentUser'
import { useUserPreferences } from '@/stores/useUserPreferences'
import { JiraIssue } from '@/types'
import { generateBranchName, getIssueTitleLink } from '@/utils/jira/issues'

import { IssueAssignMenu } from './IssueAssignMenu'
import { IssuePriorityMenu } from './IssuePriorityMenu'
import { IssueStatusMenu } from './IssueStatusMenu'

export const IssueActions = ({ ticket }: { ticket: JiraIssue }) => {
  const [preferences] = useUserPreferences()

  const formatted = useMemo(
    () => ({
      branchName: generateBranchName(ticket, preferences.branchNameFormat),
      issueTitleLink: getIssueTitleLink(ticket)
    }),
    [preferences.branchNameFormat, ticket]
  )

  return (
    <HotkeysScopeProvider scope="issue-actions">
      <HotkeysScopeProvider scope="issue-menu">
        <ActionGroup heading="General">
          <ActionPush
            value="assign-to"
            target={<IssueAssignMenu ticketKey={ticket.key} />}
            icon={UserPen}
            title="Assign to..."
            hotkeyId="issue.assign"
          />

          <AssignOrUnassignMySelf ticket={ticket} />

          <ActionPush
            value="change-status"
            target={<IssueStatusMenu ticketKey={ticket.key} />}
            icon={Route}
            title="Change status..."
            hotkeyId="issue.status"
          />

          <ActionPush
            value="change-priority"
            target={<IssuePriorityMenu ticketKey={ticket.key} />}
            icon={ChartNoAxesColumnIncreasing}
            title="Change priority..."
            hotkeyId="issue.priority"
          />
        </ActionGroup>

        <ActionSeparator />

        <ActionGroup heading="Misc">
          <ActionCopyToClipboard
            value="copy-issue-key"
            icon={Clipboard}
            content={ticket.key}
            title="Copy issue key"
            hotkeyId="clipboard.copy-key"
          />
          <ActionCopyToClipboard
            value="copy-issue-link"
            icon={Link2}
            content={ticket.url}
            title="Copy issue link"
            hotkeyId="clipboard.copy-url"
          />
          <ActionCopyToClipboard
            value="copy-issue-title"
            icon={Clipboard}
            content={ticket.summary}
            title="Copy issue title"
            hotkeyId="clipboard.copy-summary"
          />
          <ActionCopyToClipboard
            value="copy-issue-key-and-title"
            icon={Clipboard}
            content={`${ticket.key}: ${ticket.summary}`}
            title="Copy issue key and title"
            hotkeyId="clipboard.copy-markdown"
          />
          <ActionCopyToClipboard
            value="copy-issue-title-link"
            icon={Link2}
            content={formatted.issueTitleLink}
            title="Copy issue title as link"
            hotkeyId="clipboard.copy-markdown-url"
          />
          <ActionCopyToClipboard
            value="copy-git-branch-name"
            icon={GitBranch}
            content={formatted.branchName}
            title="Copy git branch name"
            hotkeyId="clipboard.copy-branch"
          />
        </ActionGroup>
      </HotkeysScopeProvider>
    </HotkeysScopeProvider>
  )
}

function AssignOrUnassignMySelf({ ticket }: { ticket: JiraIssue }) {
  const userInfo = useCurrentUser()
  const isAssignedByMe = userInfo?.email === ticket.assignee?.emailAddress

  const { mutateAsync: assignMyself } = useMutationAssignMyself()

  return isAssignedByMe ? (
    <Action
      value="unassign-myself"
      prefix={<AssigneeAvatar size="1rem" assignee={ticket.assignee} />}
      title="Unassigned from me"
      onSelect={() => assignMyself({ ticketKey: ticket.key, assign: false })}
      hotkeyId="issue.unassign-myself"
    />
  ) : (
    <Action
      value="assign-myself"
      icon={UserRoundPlus}
      title="Assign to me"
      onSelect={() => assignMyself({ ticketKey: ticket.key, assign: true })}
      hotkeyId="issue.assign-myself"
    />
  )
}
