import { useCommandInput } from '@/stores/useCommandInputStore'

import { ExtraActionsMenu } from './ExtraActionsMenu'
import { IssueTemplatesMenu } from './IssueTemplatesMenu'
import { TicketListMenu } from './TicketListMenu'

export function MainMenu() {
  const { search: searchQuery } = useCommandInput()

  const isExtraActionsMenuVisible = searchQuery.startsWith('/')
  const isTemplateMenuVisible = searchQuery.startsWith('+')

  if (isExtraActionsMenuVisible) return <ExtraActionsMenu />
  if (isTemplateMenuVisible) {
    return <IssueTemplatesMenu />
  }

  return <TicketListMenu />
}
