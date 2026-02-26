import { useMemo } from 'react'
import { Button } from '@internal/ui/components/button'

import { ActionPanel, ActionPanelSlot } from '@/common/commands'
import { HotkeysScopeProvider } from '@/lib/hotkeys'
import { usePopupSessionStore } from '@/stores/popup-session/usePopupSessionStore'
import { openOptionsPage } from '@/utils'

import { POPUP_SEARCH_STATE_KEYS } from '../searchStateKeys'

import { ExtraActionsMenu, openFeedback } from './ExtraActionsMenu'
import { IssueTemplatesMenu } from './IssueTemplatesMenu'
import { TicketListMenu } from './TicketListMenu'

export function MainMenu() {
  const search = usePopupSessionStore(
    (state) => state.inputValues[POPUP_SEARCH_STATE_KEYS.mainMenu] ?? ''
  )
  const setInputValue = usePopupSessionStore((state) => state.setInputValue)

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
        onSearchChange={(value) =>
          setInputValue(POPUP_SEARCH_STATE_KEYS.mainMenu, value)
        }
        searchStateKey={POPUP_SEARCH_STATE_KEYS.mainMenu}
        shouldFilter={shouldFilter}
        searchPlaceholder="Type a command or search...">
        {renderMenu()}

        <ActionPanelSlot>
          <Button variant={'ghost'} size={'xs'} onClick={openFeedback}>
            <span>Feedback</span>
          </Button>
          <Button
            variant={'ghost'}
            size={'xs'}
            onClick={() => openOptionsPage()}>
            <span>Settings</span>
          </Button>
        </ActionPanelSlot>
      </ActionPanel>
    </HotkeysScopeProvider>
  )
}
