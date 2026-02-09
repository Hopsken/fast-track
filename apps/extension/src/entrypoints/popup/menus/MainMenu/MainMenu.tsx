import { useCallback } from 'react'

import { CommandPanel, useCommandSearch } from '@/common/commands'
import { HotkeysScopeProvider } from '@/lib/hotkeys'

import { ExtraActionsMenu } from './ExtraActionsMenu'
import { IssueTemplatesMenu } from './IssueTemplatesMenu'
import { TicketListMenu } from './TicketListMenu'

function MainMenuInner() {
  const searchQuery = useCommandSearch()
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
  const shouldFilter = useCallback(({ search }: { search: string }) => {
    if (search.startsWith('/')) return true
    if (search.startsWith('+')) return true
    if (search.startsWith('C')) return true
    return false
  }, [])

  return (
    <HotkeysScopeProvider scope="main-menu">
      <CommandPanel
        shouldFilter={shouldFilter}
        searchPlaceholder="Search issues...">
        <MainMenuInner />
      </CommandPanel>
    </HotkeysScopeProvider>
  )
}
