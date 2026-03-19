import { useMemo } from 'react'
import { useCommandState } from '@internal/ui/components/command'

import { ActionPanel, ActionPanelSlot } from '@/common/commands'
import { useRouteState } from '@/common/commands/navigation'
import { HotkeysScopeProvider } from '@/lib/hotkeys'
import { isTicketKey } from '@/utils/jira/issues'

import { ExtraActionsMenu } from './ExtraActionsMenu'
import { FooterShortcutHints, ShortcutHint } from './FooterShortcutHints'
import { IssueTemplatesMenu } from './IssueTemplatesMenu'
import { TicketListMenu } from './TicketListMenu'

export function MainMenu() {
  const [search, setSearch] = useRouteState('search', '')

  const isExtraActionsMenuVisible = search.startsWith('/')
  const isTemplateMenuVisible =
    search.startsWith('+') || search.startsWith('C') || search.startsWith('c')

  const isDefaultView = !isExtraActionsMenuVisible && !isTemplateMenuVisible

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
        autoSelectSearchOnMount
        shouldFilter={shouldFilter}
        searchPlaceholder="Search or / for commands">
        {renderMenu()}

        {isDefaultView && (
          <ActionPanelSlot>
            <HintsSlot />
          </ActionPanelSlot>
        )}
      </ActionPanel>
    </HotkeysScopeProvider>
  )
}

function HintsSlot() {
  const ticketKey = useCommandState((s) => s.value)
  const hasTicket = isTicketKey(ticketKey)

  const hints = useMemo<ShortcutHint[]>(() => {
    const base: ShortcutHint[] = [{ keys: ['/'], label: 'Commands' }]

    if (hasTicket) {
      base.push(
        { keys: ['⌘', '⇧', 'S'], label: 'Set status' },
        { keys: ['⌘', '⇧', 'P'], label: 'Set priority' },
        { keys: ['⌘', '⇧', 'A'], label: 'Assign' }
      )
    }

    return base
  }, [hasTicket])

  return <FooterShortcutHints hints={hints} />
}
