import { useMemo, useState } from 'react'

import { ActionPanel } from '@/common/commands'
import { HotkeysScopeProvider } from '@/lib/hotkeys'

import { ExtraActionsMenu } from './ExtraActionsMenu'
import { IssueTemplatesMenu } from './IssueTemplatesMenu'
import { TicketListMenu } from './TicketListMenu'

export function MainMenu() {
  const [search, setSearch] = useState('')

  const isExtraActionsMenuVisible = search.startsWith('/')
  const isTemplateMenuVisible = search.startsWith('+') || search.startsWith('C')

  const shouldFilter = useMemo(() => {
    return !!(isExtraActionsMenuVisible || isTemplateMenuVisible)
  }, [isExtraActionsMenuVisible, isTemplateMenuVisible])

  function renderMenu() {
    if (isExtraActionsMenuVisible) return <ExtraActionsMenu />
    if (isTemplateMenuVisible) {
      return <IssueTemplatesMenu />
    }

    return <TicketListMenu searchQuery={search} />
  }

  return (
    <HotkeysScopeProvider scope="main-menu">
      <ActionPanel
        search={search}
        onSearchChange={setSearch}
        shouldFilter={shouldFilter}
        searchPlaceholder="Type a command or search...">
        {renderMenu()}
      </ActionPanel>
    </HotkeysScopeProvider>
  )
}
