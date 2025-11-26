import { type ReactNode, useEffect, useMemo } from 'react'

import {
  ActionPanelContext,
  getMenuKey,
  useActionPanelContext,
  useSectionContext
} from './ActionPanelContext'
import { useStableId } from './use-stable-id'

interface ActionPanelSubmenuProps {
  id?: string
  title: string
  subtitle?: string
  shortcut?: {
    key: string
    modifiers?: Array<'cmd' | 'ctrl' | 'opt' | 'shift'>
  }
  icon?: ReactNode
  children: ReactNode
}

export function ActionPanelSubmenu({
  id,
  title,
  subtitle,
  shortcut,
  icon,
  children
}: ActionPanelSubmenuProps) {
  const stableId = useStableId(id, 'submenu')
  const panelContext = useActionPanelContext('ActionPanel.Submenu')
  const { menuPath, registerSubmenu, claimItemOrder } = panelContext
  const sectionId = useSectionContext() ?? 'implicit-section'
  const menuKey = useMemo(() => getMenuKey(menuPath), [menuPath])
  const submenuKey = useMemo(
    () => getMenuKey([...menuPath, stableId]),
    [menuPath, stableId]
  )
  const order = useMemo(
    () => claimItemOrder(menuKey, sectionId),
    [claimItemOrder, menuKey, sectionId]
  )

  useEffect(() => {
    return registerSubmenu(
      menuKey,
      submenuKey,
      sectionId,
      {
        id: stableId,
        title,
        subtitle,
        shortcut,
        icon,
        type: 'submenu'
      },
      order
    )
  }, [
    icon,
    menuKey,
    registerSubmenu,
    order,
    sectionId,
    shortcut,
    stableId,
    submenuKey,
    subtitle,
    title
  ])

  return (
    <ActionPanelContext.Provider
      value={{
        ...panelContext,
        // Nested menus keep the full ancestry so the parent menu stays intact
        // while the child renders its own sections/actions.
        menuPath: [...menuPath, stableId]
      }}>
      {children}
    </ActionPanelContext.Provider>
  )
}
