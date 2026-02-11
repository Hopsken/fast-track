import { useMemo, useState } from 'react'
import { Button } from '@internal/ui/components/button'

import { ActionPanel, ActionPanelSlot } from '@/common/commands'
import { HotkeysScopeProvider } from '@/lib/hotkeys'

import { ExtraActionsMenu, openFeedback } from './ExtraActionsMenu'
import { IssueTemplatesMenu } from './IssueTemplatesMenu'
import { TicketListMenu } from './TicketListMenu'

export function MainMenu() {
  const [search, setSearch] = useState('')

  const isExtraActionsMenuVisible = search.startsWith('/')
  const isTemplateMenuVisible =
    search.startsWith('+') || search.startsWith('C') || search.startsWith('c')

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

        <ActionPanelSlot>
          <Button
            variant={'ghost'}
            size={'xs'}
            className="font-medium"
            onClick={openFeedback}>
            <span>Give feedback</span>
          </Button>
        </ActionPanelSlot>
      </ActionPanel>
    </HotkeysScopeProvider>
  )
}
