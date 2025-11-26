import { type ReactNode, useEffect, useMemo } from 'react'

import {
  SectionContext,
  getMenuKey,
  useActionPanelContext
} from './ActionPanelContext'
import { useStableId } from './use-stable-id'

interface ActionPanelSectionProps {
  id?: string
  title?: string
  subtitle?: string
  children: ReactNode
}

export function ActionPanelSection({
  id,
  title,
  subtitle,
  children
}: ActionPanelSectionProps) {
  const stableId = useStableId(id, 'section')
  const { menuPath, registerSection, claimSectionOrder } =
    useActionPanelContext('ActionPanel.Section')
  const menuKey = useMemo(() => getMenuKey(menuPath), [menuPath])
  const order = useMemo(
    () => claimSectionOrder(menuKey),
    [claimSectionOrder, menuKey]
  )

  useEffect(() => {
    return registerSection(menuKey, { id: stableId, title, subtitle, order })
  }, [menuKey, order, registerSection, stableId, subtitle, title])

  return (
    <SectionContext.Provider value={stableId}>
      {children}
    </SectionContext.Provider>
  )
}
