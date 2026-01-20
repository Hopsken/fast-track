import { useSearchQuery } from '@/hooks/useTicketSearch'

import { ExtraActionsMenu } from './ExtraActionsMenu'
import { TicketListMenu } from './TicketListMenu'

export function MainMenu() {
  const searchQuery = useSearchQuery()

  const isExtraActionsMenuVisible = searchQuery.startsWith('/')

  return isExtraActionsMenuVisible ? <ExtraActionsMenu /> : <TicketListMenu />
}
