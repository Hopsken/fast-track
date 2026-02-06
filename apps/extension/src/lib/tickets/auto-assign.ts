import type { UserDetails } from 'jira.js/version3/models/userDetails'

import {
  JiraAssignee,
  JiraIssue,
  JiraTransition,
  JiraUserInfo,
  UserPreferences
} from '@/types'
import { mapUserToAssignee } from '@/utils/jira/issues'

export function shouldAutoAssignOnTransition(
  preferences: UserPreferences,
  ticket: JiraIssue,
  transition: JiraTransition
) {
  return (
    preferences.autoAssignOnInProgress &&
    !ticket.assignee &&
    ticket.status?.statusCategory?.key?.toLowerCase() === 'new' &&
    transition.to.statusCategory?.key?.toLowerCase() === 'indeterminate'
  )
}

export function mapCurrentUserToAssignee(user: JiraUserInfo): JiraAssignee {
  return mapUserToAssignee({
    displayName: user.name,
    name: user.name,
    emailAddress: user.email,
    avatarUrls: { '48x48': user.avatarUrl ?? '' }
  } as UserDetails)
}
