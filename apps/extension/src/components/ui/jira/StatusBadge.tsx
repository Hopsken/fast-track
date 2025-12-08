import { cn } from '@/lib/utils'
import type { JiraStatus } from '@/types/jira'

interface StatusBadgeProps {
  status: JiraStatus
  className?: string
}

export function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const statusName = status?.name || 'Unknown'
  const statusColor = getStatusColor(status)

  return <span className={cn(statusColor, className)}>{statusName}</span>
}

function getStatusColor(status: JiraStatus): string {
  const statusName = status?.name?.toLowerCase() || ''
  const statusCategory = status?.statusCategory?.name?.toLowerCase() || ''

  // Use Jira's native status categories first
  if (statusCategory === 'done') {
    return 'text-green-500'
  }
  if (statusCategory === 'in_progress') {
    return 'text-blue-500'
  }
  if (statusCategory === 'todo') {
    return 'text-gray-500'
  }

  // Fallback to name-based detection
  if (
    statusName.includes('done') ||
    statusName.includes('resolved') ||
    statusName.includes('closed')
  ) {
    return 'text-green-500'
  }
  if (statusName.includes('progress') || statusName.includes('development')) {
    return 'text-blue-500'
  }
  if (statusName.includes('review') || statusName.includes('testing')) {
    return 'text-yellow-500'
  }
  if (statusName.includes('blocked') || statusName.includes('impediment')) {
    return 'text-red-500'
  }
  return 'text-gray-500'
}
