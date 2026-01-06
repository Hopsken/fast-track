import { cn } from '@/lib/utils'
import type { JiraStatus } from '@/types/jira'
import { getStatusColor } from '@/utils/ticket-status'

interface StatusBadgeProps {
  status: JiraStatus
  className?: string
}

export function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const statusName = status?.name || 'Unknown'
  const statusColor = getStatusColor(status)

  return <span className={cn(statusColor, className)}>{statusName}</span>
}
