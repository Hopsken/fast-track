import { type ReactNode, useEffect, useMemo } from 'react'

import { SectionContext, getMenuKey, useActionPanelContext } from './ActionPanelContext'
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
  const { menuPath, registerSection, unregisterSection } =
    useActionPanelContext('ActionPanel.Section')
  const menuKey = useMemo(() => getMenuKey(menuPath), [menuPath])

  useEffect(() => {
    registerSection(menuKey, { id: stableId, title, subtitle })

    return () => unregisterSection(menuKey, stableId)
  }, [menuKey, registerSection, stableId, subtitle, title, unregisterSection])

  return (
    <SectionContext.Provider value={stableId}>{children}</SectionContext.Provider>
  )
}
