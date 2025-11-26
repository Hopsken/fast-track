import { type ReactNode, useEffect, useMemo } from 'react'

import { getMenuKey, useActionPanelContext, useSectionContext } from './ActionPanelContext'
import { useStableId } from './use-stable-id'

interface ActionProps {
  id?: string
  title: string
  subtitle?: string
  shortcut?: { key: string; modifiers?: Array<'cmd' | 'ctrl' | 'opt' | 'shift'> }
  icon?: ReactNode
  onAction: () => void
}

export function Action({
  id,
  title,
  subtitle,
  shortcut,
  icon,
  onAction
}: ActionProps) {
  const stableId = useStableId(id, 'action')
  const { menuPath, registerAction, unregisterItem } =
    useActionPanelContext('ActionPanel.Action')
  const sectionId = useSectionContext() ?? 'implicit-section'
  const menuKey = useMemo(() => getMenuKey(menuPath), [menuPath])

  useEffect(() => {
    registerAction(menuKey, sectionId, {
      id: stableId,
      title,
      subtitle,
      shortcut,
      icon,
      onAction,
      type: 'action'
    })

    return () => unregisterItem(menuKey, sectionId, stableId)
  }, [
    icon,
    menuKey,
    onAction,
    registerAction,
    sectionId,
    shortcut,
    stableId,
    subtitle,
    title,
    unregisterItem
  ])

  return null
}
