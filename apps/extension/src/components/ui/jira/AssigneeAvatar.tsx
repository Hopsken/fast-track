import { useState } from 'react'

import { JiraAssignee } from '@/types'

interface AssigneeAvatarProps {
  assignee: JiraAssignee | null
  size?: string
  className?: string
}

export function AssigneeAvatar({
  assignee,
  size = '1.5rem',
  className = ''
}: AssigneeAvatarProps) {
  const [imageError, setImageError] = useState(false)

  if (!assignee) {
    return (
      <div
        className={`inline-flex items-center justify-center rounded-full bg-gray-200 text-xs font-medium text-gray-500 ${className}`}
        style={{ width: size, height: size }}
        title="Unassigned"
        role="img"
        aria-label="Unassigned">
        ?
      </div>
    )
  }

  const handleImageError = () => {
    setImageError(true)
  }

  const getInitials = (displayName: string): string => {
    const names = displayName.trim().split(/\s+/)
    const firstName = names[0]

    if (!firstName) {
      return ''
    }

    if (names.length === 1) {
      return firstName.substring(0, 2).toUpperCase()
    }
    return (
      firstName.charAt(0) + (names[names.length - 1]?.charAt(0) || '')
    ).toUpperCase()
  }

  const displayName = assignee.displayName || assignee.emailAddress || 'Unknown'
  const avatarUrl =
    typeof assignee.avatarUrls === 'string'
      ? assignee.avatarUrls
      : assignee.avatarUrls?.['48x48'] ||
        Object.values(assignee.avatarUrls || {})[0]

  if (!avatarUrl || imageError) {
    // Generate a consistent background color based on the user's name
    const colorIndex = displayName.charCodeAt(0) % 6
    const colors = [
      'bg-blue-400',
      'bg-green-400',
      'bg-purple-400',
      'bg-orange-400',
      'bg-pink-400',
      'bg-indigo-400'
    ]

    return (
      <div
        className={`inline-flex items-center justify-center rounded-full text-xs font-medium text-white ${colors[colorIndex]} ${className}`}
        style={{ width: size, height: size }}
        title={displayName}
        role="img"
        aria-label={`Avatar for ${displayName}`}>
        {getInitials(displayName)}
      </div>
    )
  }

  return (
    <div className={className}>
      <img
        alt={`Avatar for ${displayName}`}
        src={avatarUrl}
        className="rounded-full"
        style={{ width: size, height: size }}
        onError={handleImageError}
        title={displayName}
      />
    </div>
  )
}
