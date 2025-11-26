import { createContext, useContext } from 'react'

import { menuKeyFromPath, useActionRegistry } from './registry'
import { type MenuKey } from './types'

export interface ActionPanelContextValue {
  menuPath: string[]
  registerSection: ReturnType<typeof useActionRegistry>['registerSection']
  unregisterSection: ReturnType<typeof useActionRegistry>['unregisterSection']
  registerAction: ReturnType<typeof useActionRegistry>['registerAction']
  registerSubmenu: ReturnType<typeof useActionRegistry>['registerSubmenu']
  unregisterItem: ReturnType<typeof useActionRegistry>['unregisterItem']
  removeMenuTree: ReturnType<typeof useActionRegistry>['removeMenuTree']
  claimSectionOrder: (menuKey: MenuKey) => number
  claimItemOrder: (menuKey: MenuKey, sectionId: string) => number
}

export const ActionPanelContext = createContext<ActionPanelContextValue | null>(
  null
)

export const SectionContext = createContext<string | undefined>(undefined)

export function useActionPanelContext(component: string) {
  const context = useContext(ActionPanelContext)
  if (!context) {
    throw new Error(`${component} must be used within an ActionPanel`)
  }

  return context
}

export function useSectionContext() {
  return useContext(SectionContext)
}

export const getMenuKey = menuKeyFromPath
