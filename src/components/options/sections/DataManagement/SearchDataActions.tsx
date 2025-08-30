import { FieldControl } from '~/components/ui/forms'
import { useStorage, StorageKey } from '~/storage'

export function SearchDataActions() {
  const [, setTicketsData] = useStorage(StorageKey.TicketsData, [])
  const [, setSearchHistory] = useStorage(StorageKey.SearchHistory, [])
  const [, setViewHistory] = useStorage(StorageKey.TicketViewHistory, [])

  const clearAllData = async () => {
    if (
      confirm(
        'Are you sure you want to clear all collected ticket data? This cannot be undone.'
      )
    ) {
      await setTicketsData([])
      await setSearchHistory([])
      await setViewHistory([])
    }
  }

  const clearSearchHistory = async () => {
    if (confirm('Clear search history?')) {
      await setSearchHistory([])
    }
  }

  return (
    <div className="space-y-4">
      <FieldControl
        size="lg"
        title="Data Management"
        description="Manage your collected ticket data and search history">
        <div className="space-y-2">
          <button
            onClick={clearSearchHistory}
            className="w-full rounded-lg border border-orange-200 bg-orange-50 px-4 py-2 text-sm text-orange-700 transition-colors hover:bg-orange-100">
            Clear Search History
          </button>
          <button
            onClick={clearAllData}
            className="w-full rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700 transition-colors hover:bg-red-100">
            Clear All Data
          </button>
        </div>
      </FieldControl>

      <FieldControl
        size="lg"
        title="Data Collection"
        description="Ticket data is automatically collected when you visit Jira boards and issues">
        <div className="space-y-2 text-sm text-gray-600">
          <p>
            • Data is collected from board views, issue details, and search
            results
          </p>
          <p>• Up to 1,000 most recent tickets are stored</p>
          <p>• View counts and timestamps are tracked for relevance scoring</p>
          <p>• All data is stored locally in your browser</p>
        </div>
      </FieldControl>
    </div>
  )
}
