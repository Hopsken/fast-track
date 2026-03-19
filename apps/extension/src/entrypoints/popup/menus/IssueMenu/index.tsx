import { useCallback } from 'react'

import { useNavigation } from '@/common/commands'

import { IssueAssignMenu } from './IssueAssignMenu'
import { IssueMenu } from './IssueMenu'
import { IssueMergeRequestsMenu } from './IssueMergeRequestsMenu'
import { IssuePriorityMenu } from './IssuePriorityMenu'
import { IssueStatusMenu } from './IssueStatusMenu'

export function useIssueMenus() {
  const navigate = useNavigation()

  const openIssueMenu = useCallback(
    (ticketKey: string) => {
      navigate.push(<IssueMenu ticketKey={ticketKey} />, { title: ticketKey })
    },
    [navigate]
  )

  const openIssueAssignMenu = useCallback(
    (ticketKey: string) => {
      navigate.push(<IssueAssignMenu ticketKey={ticketKey} />, {
        breadcrumb: [ticketKey, 'Assign']
      })
    },
    [navigate]
  )

  const openIssueMergeRequestsMenu = useCallback(
    (ticketKey: string) => {
      navigate.push(<IssueMergeRequestsMenu ticketKey={ticketKey} />, {
        breadcrumb: [ticketKey, 'Merge requests']
      })
    },
    [navigate]
  )

  const openIssuePriorityMenu = useCallback(
    (ticketKey: string) => {
      navigate.push(<IssuePriorityMenu ticketKey={ticketKey} />, {
        breadcrumb: [ticketKey, 'Priority']
      })
    },
    [navigate]
  )

  const openIssueStatusMenu = useCallback(
    (ticketKey: string) => {
      navigate.push(<IssueStatusMenu ticketKey={ticketKey} />, {
        breadcrumb: [ticketKey, 'Status']
      })
    },
    [navigate]
  )

  return {
    openIssueMenu,
    openIssueAssignMenu,
    openIssueMergeRequestsMenu,
    openIssuePriorityMenu,
    openIssueStatusMenu
  }
}
