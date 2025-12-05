import { TicketList } from '@/components/tickets'
import { openOptionsPage } from '@/utils'

export function SearchResultMenu() {
  const handleOpenOptionsPage = () => {
    openOptionsPage()
    window.close()
  }

  return <TicketList onOpenOptionsPage={handleOpenOptionsPage} />
}
