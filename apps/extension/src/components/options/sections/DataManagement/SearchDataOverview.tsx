import { FormField } from '~/components/ui/forms'
import { useStorage, StorageKey } from '~/storage'

interface SearchDataOverviewProps {
  ticketCount: number
}

export function SearchDataOverview({ ticketCount }: SearchDataOverviewProps) {
  const [viewHistory] = useStorage(StorageKey.TicketViewHistory, [])

  return (
    <FormField
      size="lg"
      title="Data Overview"
      description="Current status of your ticket data collection">
      <div
        className="grid grid-cols-2 gap-4 text-center"
        role="group"
        aria-label="Data statistics">
        <div className="rounded-lg bg-blue-50 p-3">
          <div
            className="text-2xl font-bold text-blue-600"
            aria-label={`${ticketCount} tickets collected`}>
            {ticketCount}
          </div>
          <div className="text-sm text-gray-600">Collected Tickets</div>
        </div>
        <div className="rounded-lg bg-purple-50 p-3">
          <div
            className="text-2xl font-bold text-purple-600"
            aria-label={`${viewHistory.length} view records`}>
            {viewHistory.length}
          </div>
          <div className="text-sm text-gray-600">View Records</div>
        </div>
      </div>
    </FormField>
  )
}
