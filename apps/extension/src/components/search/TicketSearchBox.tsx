import { CommandInput } from '@internal/ui/components/command'

import { useIsSearching } from '~/stores/useTicketStore'

interface TicketSearchBoxProps {
  value: string
  onValueChange: (value: string) => void
}

export function TicketSearchBox({
  value,
  onValueChange
}: TicketSearchBoxProps) {
  const isSearching = useIsSearching()

  return (
    <div className="relative flex h-[52px] items-center gap-3 border-b-2 border-gray-200 pl-5 pr-5">
      <CommandInput
        value={value}
        onValueChange={onValueChange}
        placeholder={isSearching ? 'Searching...' : 'Search tickets...'}
        aria-label="Search tickets"
        aria-busy={isSearching}
      />
    </div>
  )
}
