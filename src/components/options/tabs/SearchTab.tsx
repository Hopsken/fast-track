import { SearchDataActions } from '../sections/DataManagement/SearchDataActions'
import { SearchDataOverview } from '../sections/DataManagement/SearchDataOverview'

interface SearchTabProps {
  ticketCount: number
}

export function SearchTab({ ticketCount }: SearchTabProps) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          Search & Data Management
        </h2>
        <div className="space-y-6">
          <SearchDataOverview ticketCount={ticketCount} />
          <SearchDataActions />
        </div>
      </div>
    </div>
  )
}
