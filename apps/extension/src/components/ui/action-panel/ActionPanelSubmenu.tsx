import { type ReactNode, useEffect, useMemo } from 'react'

import { ActionPanelContext, getMenuKey, useActionPanelContext, useSectionContext } from './ActionPanelContext'
import { useStableId } from './use-stable-id'

interface ActionPanelSubmenuProps {
  id?: string
  title: string
  subtitle?: string
  shortcut?: { key: string; modifiers?: Array<'cmd' | 'ctrl' | 'opt' | 'shift'> }
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
  const { menuPath, registerSubmenu, unregisterItem, removeMenuTree } = panelContext
  const sectionId = useSectionContext() ?? 'implicit-section'
  const menuKey = useMemo(() => getMenuKey(menuPath), [menuPath])
  const submenuKey = useMemo(
    () => getMenuKey([...menuPath, stableId]),
    [menuPath, stableId]
  )

  useEffect(() => {
    registerSubmenu(menuKey, submenuKey, sectionId, {
      id: stableId,
      title,
      subtitle,
      shortcut,
      icon,
      type: 'submenu'
    })

    return () => {
      unregisterItem(menuKey, sectionId, stableId)
      removeMenuTree(submenuKey)
    }
  }, [
    icon,
    menuKey,
    registerSubmenu,
    removeMenuTree,
    sectionId,
    shortcut,
    stableId,
    submenuKey,
    subtitle,
    title,
    unregisterItem
  ])

  return (
    <ActionPanelContext.Provider
      value={{
        ...panelContext,
        menuPath: [...menuPath, stableId]
      }}>
      {children}
    </ActionPanelContext.Provider>
  )
}
