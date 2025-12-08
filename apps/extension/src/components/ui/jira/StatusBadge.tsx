import { Badge } from '@internal/ui/components/badge'

import { cn } from '@/lib/utils'
import type { JiraStatus } from '@/types/jira'

interface StatusBadgeProps {
  status: JiraStatus
  className?: string
}

export function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const statusName = status?.name || 'Unknown'
  const statusColor = getStatusColor(status)

  return <Badge className={cn(statusColor, className)}>{statusName}</Badge>
}

function getStatusColor(status: JiraStatus): string {
  const statusName = status?.name?.toLowerCase() || ''
  const statusCategory = status?.statusCategory?.name?.toLowerCase() || ''

  // Use Jira's native status categories first
  if (statusCategory === 'done') {
    return 'bg-green-500'
  }
  if (statusCategory === 'in_progress') {
    return 'bg-blue-500'
  }
  if (statusCategory === 'todo') {
    return 'bg-gray-500'
  }

  // Fallback to name-based detection
  if (
    statusName.includes('done') ||
    statusName.includes('resolved') ||
    statusName.includes('closed')
  ) {
    return 'bg-green-500'
  }
  if (statusName.includes('progress') || statusName.includes('development')) {
    return 'bg-blue-500'
  }
  if (statusName.includes('review') || statusName.includes('testing')) {
    return 'bg-yellow-500'
  }
  if (statusName.includes('blocked') || statusName.includes('impediment')) {
    return 'bg-red-500'
  }
  return 'bg-gray-500'
}
