import { UserDetails } from 'jira.js/version3/models/userDetails'

import { JiraAssignee } from '@/types'

import { AssigneeAvatar } from '../ui'

import { Action, ActionProps } from './Action'

export interface ActionUserProps
  extends Omit<ActionProps, 'prefix' | 'icon' | 'title'> {
  user: UserDetails
}

export function ActionUser({ user, ...props }: ActionUserProps) {
  return (
    <Action
      {...props}
      prefix={<AssigneeAvatar assignee={user as JiraAssignee} />}
      title={user.displayName ?? user.name ?? user.emailAddress ?? 'Anonymous'}
    />
  )
}
