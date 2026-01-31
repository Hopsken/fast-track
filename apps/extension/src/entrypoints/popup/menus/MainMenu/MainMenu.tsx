import { useSearchQuery } from '@/hooks/useTicketSearch'

import { TemplateMenu } from '../CreateIssue'

import { ExtraActionsMenu } from './ExtraActionsMenu'
import { TicketListMenu } from './TicketListMenu'

export function MainMenu() {
  const searchQuery = useSearchQuery()

  const isExtraActionsMenuVisible = searchQuery.startsWith('/')
  const isTemplateMenuVisible = searchQuery.startsWith('+')

  if (isExtraActionsMenuVisible) return <ExtraActionsMenu />
  if (isTemplateMenuVisible) {
    return <TemplateMenu keyword={searchQuery.slice(1)} />
  }

  return <TicketListMenu />
}
