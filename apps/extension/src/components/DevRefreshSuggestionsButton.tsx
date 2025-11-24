import { useCallback, useState } from 'react'

import { getTicketSuggestionService } from '@/services/ticket-suggestion-service'

export function DevRefreshSuggestionsButton() {
  const [refreshing, setRefreshing] = useState(false)

  const handleClick = useCallback(async () => {
    if (refreshing) return

    try {
      setRefreshing(true)
      await getTicketSuggestionService().refreshSuggestions('manual', {
        force: true
      })
    } catch (error) {
      console.error('Dev refresh suggestions failed', error)
    } finally {
      setRefreshing(false)
    }
  }, [refreshing])

  return (
    <button
      onClick={handleClick}
      disabled={refreshing}
      className="rounded-md border border-dashed border-gray-300 px-2 py-1 text-[11px] font-medium text-gray-600 transition-all duration-150 hover:border-gray-500 hover:text-gray-800 disabled:cursor-not-allowed disabled:opacity-60">
      {refreshing ? 'Refreshing…' : 'Dev: Refresh suggestions'}
    </button>
  )
}
