import { useCallback, useState } from 'react'
import { RefreshCw } from 'lucide-react'

import { getTicketService } from '@/services/ticket-service'
import { showToast } from '@/stores/useToastStore'

import { Action } from './actions'

export function DevActionRefreshSuggestions() {
  const [refreshing, setRefreshing] = useState(false)

  const handleClick = useCallback(async () => {
    if (refreshing) return

    try {
      setRefreshing(true)
      const toast = showToast({
        style: 'loading',
        title: 'Refreshing suggestions...'
      })
      await getTicketService().refreshSuggestions('manual', {
        force: true
      })
      toast.update({
        style: 'success',
        title: 'Suggestions refreshed'
      })
    } catch (error) {
      showToast({
        style: 'failure',
        title: 'Failed to refresh suggestions',
        message: error
      })
    } finally {
      setRefreshing(false)
    }
  }, [refreshing])

  return (
    <Action
      icon={RefreshCw}
      title={refreshing ? 'Refreshing…' : 'Dev: Refresh suggestions'}
      onSelect={handleClick}
    />
  )
}
