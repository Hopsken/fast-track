import type { JiraStatus } from '~/storage'

interface StatusBadgeProps {
  status: JiraStatus
  className?: string
}

export function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const statusName = status?.name || 'Unknown'
  const statusColor = getStatusColor(status)

  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium text-white ${statusColor} ${className}`}
      title={status?.description || statusName}>
      {statusName}
    </span>
  )
}

function getStatusColor(status: JiraStatus): string {
  const statusName = status?.name?.toLowerCase() || ''
  const statusCategory = status?.statusCategory?.name?.toLowerCase() || ''

  // Use Jira's native status categories first
  if (statusCategory === 'done') {
    return 'bg-green-400'
  }
  if (statusCategory === 'in_progress') {
    return 'bg-blue-400'
  }
  if (statusCategory === 'todo') {
    return 'bg-gray-400'
  }

  // Fallback to name-based detection
  if (
    statusName.includes('done') ||
    statusName.includes('resolved') ||
    statusName.includes('closed')
  ) {
    return 'bg-green-400'
  }
  if (statusName.includes('progress') || statusName.includes('development')) {
    return 'bg-blue-400'
  }
  if (statusName.includes('review') || statusName.includes('testing')) {
    return 'bg-yellow-400'
  }
  if (statusName.includes('blocked') || statusName.includes('impediment')) {
    return 'bg-red-400'
  }
  return 'bg-gray-400'
}
