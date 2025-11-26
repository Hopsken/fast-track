import { type ReactNode, useEffect, useMemo } from 'react'

import {
  getMenuKey,
  useActionPanelContext,
  useSectionContext
} from './ActionPanelContext'
import { useStableId } from './use-stable-id'

interface ActionProps {
  id?: string
  title: string

  shortcut?: {
    key: string
    modifiers?: Array<'cmd' | 'ctrl' | 'opt' | 'shift'>
  }
  icon?: ReactNode
  onAction: () => void
}

export function Action({
  id,
  title,

  shortcut,
  icon,
  onAction
}: ActionProps) {
  const stableId = useStableId(id, 'action')
  const { menuPath, registerAction, claimItemOrder } =
    useActionPanelContext('ActionPanel.Action')
  const sectionId = useSectionContext() ?? 'implicit-section'
  const menuKey = useMemo(() => getMenuKey(menuPath), [menuPath])
  const order = useMemo(
    () => claimItemOrder(menuKey, sectionId),
    [claimItemOrder, menuKey, sectionId]
  )

  useEffect(() => {
    return registerAction(
      menuKey,
      sectionId,
      {
        id: stableId,
        title,

        shortcut,
        icon,
        onAction,
        type: 'action'
      },
      order
    )
  }, [
    claimItemOrder,
    icon,
    menuKey,
    order,
    onAction,
    registerAction,
    sectionId,
    shortcut,
    stableId,

    title
  ])

  return null
}
