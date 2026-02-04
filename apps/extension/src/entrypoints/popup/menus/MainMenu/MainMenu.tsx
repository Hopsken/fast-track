import { HotkeysScopeProvider } from '@/lib/hotkeys'
import { useCommandInput } from '@/stores/command/useCommandInputStore'

import { ExtraActionsMenu } from './ExtraActionsMenu'
import { IssueTemplatesMenu } from './IssueTemplatesMenu'
import { TicketListMenu } from './TicketListMenu'

function MainMenuInner() {
  const { search: searchQuery } = useCommandInput()

  const isExtraActionsMenuVisible = searchQuery.startsWith('/')
  const isTemplateMenuVisible =
    searchQuery.startsWith('+') || searchQuery.startsWith('C')

  if (isExtraActionsMenuVisible) return <ExtraActionsMenu />
  if (isTemplateMenuVisible) {
    return <IssueTemplatesMenu />
  }

  return <TicketListMenu />
}

export function MainMenu() {
  return (
    <HotkeysScopeProvider scope="main-menu">
      <MainMenuInner />
    </HotkeysScopeProvider>
  )
}
