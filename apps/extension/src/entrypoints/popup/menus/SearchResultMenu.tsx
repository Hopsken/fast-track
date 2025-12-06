import { CommandList } from '@internal/ui/components/command'

import { DevActionRefreshSuggestions } from '@/components/DevActionRefreshSuggestions'
import { DevOnly } from '@/components/DevOnly'
import { TicketList } from '@/components/tickets'
import { openOptionsPage } from '@/utils'

export function SearchResultMenu() {
  const handleOpenOptionsPage = () => {
    openOptionsPage()
    window.close()
  }

  return (
    <CommandList aria-label="Ticket search results">
      <TicketList onOpenOptionsPage={handleOpenOptionsPage} />

      <DevOnly>
        <DevActionRefreshSuggestions />
      </DevOnly>
    </CommandList>
  )
}
