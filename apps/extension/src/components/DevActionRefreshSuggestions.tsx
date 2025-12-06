import { useCallback, useState } from 'react'
import { RefreshCw } from 'lucide-react'

import { getTicketService } from '@/services/ticket-service'

import { Action } from './actions'

export function DevActionRefreshSuggestions() {
  const [refreshing, setRefreshing] = useState(false)

  const handleClick = useCallback(async () => {
    if (refreshing) return

    try {
      setRefreshing(true)
      await getTicketService().suggestions.refresh('manual', {
        force: true
      })
    } catch (error) {
      console.error('Dev refresh suggestions failed', error)
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
