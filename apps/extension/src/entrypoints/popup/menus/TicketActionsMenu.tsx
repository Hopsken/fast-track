import { memo, useMemo } from 'react'
import {
  CommandGroup,
  CommandItem,
  CommandList,
  CommandSeparator
} from '@internal/ui/components/command'
import { useMemoizedFn } from 'ahooks'
import {
  ChartNoAxesColumnIncreasing,
  Clipboard,
  GitBranch,
  GitPullRequest,
  Link2,
  MessageSquareText,
  Route,
  UserPen,
  UserRoundPlus
} from 'lucide-react'

import { AssigneeAvatar } from '@/components'
import {
  Action,
  ActionCopyToClipboard,
  ActionHyperLink,
  ActionPush
} from '@/components/actions'
import { ActionShortcut } from '@/components/actions/ActionShortcut'
import { useCommandNavigate } from '@/components/CommandRouter'
import { PrefetchProvider } from '@/components/PrefetchQuery'
import { TicketBasicFields } from '@/components/tickets'
import { useIsOptionKeyPressed } from '@/hooks/useIsOptionKeyPressed'
import { useIssueComments } from '@/hooks/useIssueComments'
import { useIssueEditMeta } from '@/hooks/useIssueEditMeta'
import { useIssueMergeRequests } from '@/hooks/useIssueMergeRequests'
import { useIssuePriorities } from '@/hooks/useIssuePriorities'
import { useIssueTransitions } from '@/hooks/useIssueTransitions'
import { useMutationAssignMyself } from '@/hooks/useMutationAssignIssue'
import { useTicketDetails } from '@/hooks/useTicketDetails'
import { useCurrentUser } from '@/stores/useCurrentUser'
import { useUserPreferences } from '@/stores/useUserPreferences'
import { IssueDetail, JiraTicket } from '@/types'
import { generateBranchName, getIssueTitleLink } from '@/utils/jira/issues'
import { openJiraIssue } from '@/utils/open-jira-issue'

import {
  getProviderIcon,
  getProviderOpenTitle
} from './TicketMergeRequestsMenu'

type Props = {
  ticketKey: string
}

declare global {
  interface RouteMap {
    '/ticket/actions': Props
  }
}

export const TicketActionsMenu = memo(function TicketActionsMenu({
  ticketKey
}: Props) {
  const { data: ticket } = useTicketDetails(ticketKey)

  if (!ticket) {
    return null
  }

  return <TicketActionsMenuInner ticket={ticket} />
})

const TicketActionsMenuInner = ({ ticket }: { ticket: IssueDetail }) => {
  const isOptionKeyPressed = useIsOptionKeyPressed()
  const [preferences] = useUserPreferences()

  const { push } = useCommandNavigate()

  const onSelect = useMemoizedFn(() => {
    if (isOptionKeyPressed) {
      openJiraIssue(ticket.key)
    } else {
      push('/ticket/details', { ticketKey: ticket.key })
    }
  })

  const formatted = useMemo(
    () => ({
      branchName: generateBranchName(ticket, preferences.branchNameFormat),
      issueTitleLink: getIssueTitleLink(ticket)
    }),
    [preferences.branchNameFormat, ticket]
  )

  return (
    <CommandList>
      <CommandGroup>
        <CommandItem value={ticket.key} onSelect={onSelect} className="mb-1">
          <TicketBasicFields ticket={ticket} />
          <ActionShortcut
            shortcut={{
              modifiers: isOptionKeyPressed ? ['alt'] : [],
              key: 'enter'
            }}
          />
        </CommandItem>

        <MergeRequestsActions ticket={ticket} />
      </CommandGroup>

      <CommandSeparator />

      <CommandGroup heading="General">
        <ActionPush
          value="assign-to"
          target={() => ({
            path: '/ticket/assign',
            state: { ticketKey: ticket.key }
          })}
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
          target={() => ({
            path: '/ticket/status',
            state: { ticketKey: ticket.key }
          })}
          icon={Route}
          title="Change status..."
          shortcut={{
            macOS: { modifiers: ['cmd', 'shift'], key: 's' },
            Windows: { modifiers: ['alt', 'shift'], key: 's' }
          }}
        />

        <ActionPush
          value="change-priority"
          target={() => ({
            path: '/ticket/priority',
            state: { ticketKey: ticket.key }
          })}
          icon={ChartNoAxesColumnIncreasing}
          title="Change priority..."
          shortcut={{
            macOS: { modifiers: ['cmd', 'shift'], key: 'p' },
            Windows: { modifiers: ['alt', 'shift'], key: 'p' }
          }}
        />

        <ActionPush
          value="comments"
          target={() => ({
            path: '/ticket/comments',
            state: { ticketKey: ticket.key }
          })}
          icon={MessageSquareText}
          title="Comments..."
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

function PrefetchActions({ ticket }: { ticket: JiraTicket }) {
  useIssuePriorities()
  useIssueEditMeta(ticket.key)
  useIssueTransitions(ticket)
  useIssueComments(ticket.key)

  return null
}

function MergeRequestsActions({ ticket }: { ticket: JiraTicket }) {
  const { data: mergeRequests } = useIssueMergeRequests(ticket.key)
  const [newestMergeRequest] = mergeRequests || []
  const hasMultipleMergeRequests = (mergeRequests?.length ?? 0) > 1

  return (
    <>
      {newestMergeRequest && !hasMultipleMergeRequests && (
        <ActionHyperLink
          value="open-merge-request"
          icon={getProviderIcon(newestMergeRequest.provider)}
          url={newestMergeRequest.url}
          title={getProviderOpenTitle(newestMergeRequest.provider)}
          shortcut={{
            macOS: { modifiers: ['cmd', 'shift'], key: 'g' },
            Windows: { modifiers: ['alt', 'shift'], key: 'g' }
          }}
        />
      )}
      {hasMultipleMergeRequests && (
        <ActionPush
          value="open-merge-requests"
          icon={GitPullRequest}
          title="Open merge requests..."
          shortcut={{
            macOS: { modifiers: ['cmd', 'shift'], key: 'g' },
            Windows: { modifiers: ['alt', 'shift'], key: 'g' }
          }}
          target={() => ({
            path: '/ticket/merge-requests',
            state: { ticketKey: ticket.key }
          })}
        />
      )}
    </>
  )
}
