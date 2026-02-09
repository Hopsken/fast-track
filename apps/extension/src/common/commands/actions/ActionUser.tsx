import { GeneralIcon } from '@/components'
import { JiraUser } from '@/types'

import { Action, ActionProps } from './Action'

export interface ActionUserProps
  extends Omit<ActionProps, 'prefix' | 'icon' | 'title'> {
  user: JiraUser
}

export function ActionUser({ user, ...props }: ActionUserProps) {
  return (
    <Action
      {...props}
      prefix={<GeneralIcon iconUrl={user.avatarUrl} alt={user.displayName} />}
      title={user.displayName ?? user.emailAddress ?? 'Anonymous'}
    />
  )
}
