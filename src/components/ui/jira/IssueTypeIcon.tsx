import { useState } from 'react'

import type { JiraIssueType } from '~/storage'

interface IssueTypeIconProps {
  issueType: JiraIssueType
  size?: string
  className?: string
}

export function IssueTypeIcon({
  issueType,
  size = '1rem',
  className = ''
}: IssueTypeIconProps) {
  const [imageError, setImageError] = useState(false)

  const handleImageError = () => {
    setImageError(true)
  }

  if (!issueType.iconUrl || imageError) {
    return (
      <div
        className={`inline-flex items-center justify-center rounded bg-gray-100 text-xs font-medium text-gray-600 ${className}`}
        style={{ width: size, height: size }}
        title={issueType.name || 'Issue'}
        role="img"
        aria-label={issueType.name || 'Issue'}>
        {issueType.name ? issueType.name.charAt(0).toUpperCase() : '?'}
      </div>
    )
  }

  return (
    <div role="presentation" className={className}>
      <img
        alt={issueType.name || 'Issue'}
        src={issueType.iconUrl}
        className="block"
        style={{ width: size, height: size }}
        onError={handleImageError}
        title={issueType.name}
      />
    </div>
  )
}