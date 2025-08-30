import { FieldControl } from '~/components/ui/forms'
import { useStorage, StorageKey } from '~/storage'

interface SearchDataOverviewProps {
  ticketCount: number
}

export function SearchDataOverview({ ticketCount }: SearchDataOverviewProps) {
  const [searchHistory] = useStorage(StorageKey.SearchHistory, [])
  const [viewHistory] = useStorage(StorageKey.TicketViewHistory, [])

  return (
    <FieldControl
      size="lg"
      title="Data Overview"
      description="Current status of your ticket data collection">
      <div className="grid grid-cols-3 gap-4 text-center">
        <div className="rounded-lg bg-blue-50 p-3">
          <div className="text-2xl font-bold text-blue-600">{ticketCount}</div>
          <div className="text-sm text-gray-600">Collected Tickets</div>
        </div>
        <div className="rounded-lg bg-green-50 p-3">
          <div className="text-2xl font-bold text-green-600">
            {searchHistory.length}
          </div>
          <div className="text-sm text-gray-600">Search History</div>
        </div>
        <div className="rounded-lg bg-purple-50 p-3">
          <div className="text-2xl font-bold text-purple-600">
            {viewHistory.length}
          </div>
          <div className="text-sm text-gray-600">View Records</div>
        </div>
      </div>
    </FieldControl>
  )
}
