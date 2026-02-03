import { UserDetails } from 'jira.js/version3/models/userDetails'

import { JiraAssignee } from '@/types'

import { UserAvatar } from '../UserAvatar'

interface AssigneeAvatarProps {
  assignee: JiraAssignee | null
  size?: string
  className?: string
}

const toUserDetails = (assignee: JiraAssignee): UserDetails => {
  const avatarUrls =
    typeof assignee.avatarUrls === 'string'
      ? { '48x48': assignee.avatarUrls }
      : assignee.avatarUrls
  return {
    displayName: assignee.displayName,
    emailAddress: assignee.emailAddress,
    avatarUrls
  }
}

export function AssigneeAvatar({
  assignee,
  size = '1.5rem',
  className = ''
}: AssigneeAvatarProps) {
  return (
    <UserAvatar
      user={assignee ? toUserDetails(assignee) : undefined}
      size={size}
      className={className}
    />
  )
}
