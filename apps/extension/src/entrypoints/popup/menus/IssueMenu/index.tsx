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
      navigate.push(<IssueMenu ticketKey={ticketKey} />)
    },
    [navigate]
  )

  const openIssueAssignMenu = useCallback(
    (ticketKey: string) => {
      navigate.push(<IssueAssignMenu ticketKey={ticketKey} />)
    },
    [navigate]
  )

  const openIssueMergeRequestsMenu = useCallback(
    (ticketKey: string) => {
      navigate.push(<IssueMergeRequestsMenu ticketKey={ticketKey} />)
    },
    [navigate]
  )

  const openIssuePriorityMenu = useCallback(
    (ticketKey: string) => {
      navigate.push(<IssuePriorityMenu ticketKey={ticketKey} />)
    },
    [navigate]
  )

  const openIssueStatusMenu = useCallback(
    (ticketKey: string) => {
      navigate.push(<IssueStatusMenu ticketKey={ticketKey} />)
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
