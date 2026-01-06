import { JiraStatus } from '@/types'

export function getStatusColor(status: JiraStatus): string {
  const statusName = status?.name?.toLowerCase() || ''
  const statusCategoryKey = status?.statusCategory?.key?.toLowerCase() || ''

  // Use Jira's native status categories first
  if (statusCategoryKey === 'done') {
    return 'text-green-500'
  }
  if (statusCategoryKey === 'indeterminate') {
    return 'text-blue-500'
  }
  if (statusCategoryKey === 'new') {
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

export function getStatusDotColor(status: JiraStatus) {
  const statusName = status?.name?.toLowerCase() || ''
  const statusCategoryKey = status?.statusCategory?.key?.toLowerCase() || ''

  // Use Jira's native status categories first
  if (statusCategoryKey === 'done') {
    return 'bg-green-500'
  }
  if (statusCategoryKey === 'indeterminate') {
    return 'bg-blue-500'
  }
  if (statusCategoryKey === 'new') {
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
