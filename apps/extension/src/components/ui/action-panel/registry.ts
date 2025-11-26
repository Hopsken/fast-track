import { useCallback, useReducer } from 'react'

import {
  type ActionNode,
  type ActionNodeAction,
  type ActionNodeSubmenu,
  type ActionSectionState,
  type MenuKey,
  type MenuState
} from './types'

interface RegisterSectionAction {
  type: 'REGISTER_SECTION'
  menuKey: MenuKey
  section: Pick<ActionSectionState, 'id' | 'title' | 'subtitle' | 'order'>
}

interface UnregisterSectionAction {
  type: 'UNREGISTER_SECTION'
  menuKey: MenuKey
  sectionId: string
}

interface RegisterActionAction {
  type: 'REGISTER_ACTION'
  menuKey: MenuKey
  sectionId: string
  action: ActionNodeAction
  order: number
}

interface RegisterSubmenuAction {
  type: 'REGISTER_SUBMENU'
  menuKey: MenuKey
  submenuKey: MenuKey
  sectionId: string
  submenu: ActionNodeSubmenu
  order: number
}

interface UnregisterItemAction {
  type: 'UNREGISTER_ITEM'
  menuKey: MenuKey
  sectionId: string
  itemId: string
}

interface RemoveMenuTreeAction {
  type: 'REMOVE_MENU_TREE'
  menuKey: MenuKey
}

type RegistryAction =
  | RegisterSectionAction
  | UnregisterSectionAction
  | RegisterActionAction
  | RegisterSubmenuAction
  | UnregisterItemAction
  | RemoveMenuTreeAction

type RegistryState = Record<MenuKey, MenuState>

export const ROOT_MENU_KEY = 'root'

export function menuKeyFromPath(path: string[]): MenuKey {
  if (!path.length) return ROOT_MENU_KEY

  return path.join('/')
}

export function useActionRegistry() {
  const [menus, dispatch] = useReducer(registryReducer, undefined, () => ({
    [ROOT_MENU_KEY]: { key: ROOT_MENU_KEY, sections: [] }
  }))

  const registerSection = useCallback(
    (menuKey: MenuKey, section: RegisterSectionAction['section']) => {
      dispatch({
        type: 'REGISTER_SECTION',
        menuKey,
        section
      })
    },
    []
  )

  const unregisterSection = useCallback((menuKey: MenuKey, sectionId: string) => {
    dispatch({
      type: 'UNREGISTER_SECTION',
      menuKey,
      sectionId
    })
  }, [])

  const registerAction = useCallback(
    (
      menuKey: MenuKey,
      sectionId: string,
      action: ActionNodeAction,
      order: number
    ) => {
      dispatch({
        type: 'REGISTER_ACTION',
        menuKey,
        sectionId,
        action,
        order
      })
    },
    []
  )

  const registerSubmenu = useCallback(
    (
      menuKey: MenuKey,
      submenuKey: MenuKey,
      sectionId: string,
      submenu: ActionNodeSubmenu,
      order: number
    ) => {
      dispatch({
        type: 'REGISTER_SUBMENU',
        menuKey,
        submenuKey,
        sectionId,
        submenu,
        order
      })
    },
    []
  )

  const unregisterItem = useCallback(
    (menuKey: MenuKey, sectionId: string, itemId: string) => {
      dispatch({
        type: 'UNREGISTER_ITEM',
        menuKey,
        sectionId,
        itemId
      })
    },
    []
  )

  const removeMenuTree = useCallback((menuKey: MenuKey) => {
    dispatch({ type: 'REMOVE_MENU_TREE', menuKey })
  }, [])

  return {
    menus,
    registerSection,
    unregisterSection,
    registerAction,
    registerSubmenu,
    unregisterItem,
    removeMenuTree
  }
}

function registryReducer(state: RegistryState, action: RegistryAction): RegistryState {
  if (action.type === 'REGISTER_SECTION') {
    const menu = state[action.menuKey] ?? { key: action.menuKey, sections: [] }
    const nextSections = upsertSection(menu.sections, {
      id: action.section.id,
      title: action.section.title,
      subtitle: action.section.subtitle,
      order: action.section.order
    })

    return {
      ...state,
      [action.menuKey]: {
        ...menu,
        sections: nextSections
      }
    }
  }

  if (action.type === 'UNREGISTER_SECTION') {
    const menu = state[action.menuKey]
    if (!menu) return state

    const nextSections = menu.sections.filter(
      (section) => section.id !== action.sectionId
    )

    return {
      ...state,
      [action.menuKey]: {
        ...menu,
        sections: nextSections
      }
    }
  }

  if (action.type === 'REGISTER_ACTION' || action.type === 'REGISTER_SUBMENU') {
    const menu = state[action.menuKey] ?? { key: action.menuKey, sections: [] }
    const section = getOrCreateSection(menu.sections, action.sectionId)
    const item =
      action.type === 'REGISTER_ACTION'
        ? { ...action.action, order: action.order }
        : ({ ...action.submenu, type: 'submenu', order: action.order } as ActionNode)

    const updatedSections = menu.sections.map((existing) => {
      if (existing.id !== section.id) return existing

      const items = upsertItem(existing.items, item)
      return { ...existing, items }
    })

    return {
      ...state,
      [action.menuKey]: {
        ...menu,
        sections: updatedSections
      },
      ...(action.type === 'REGISTER_SUBMENU'
        ? ensureMenuExists(state, action.submenuKey)
        : null)
    }
  }

  if (action.type === 'UNREGISTER_ITEM') {
    const menu = state[action.menuKey]
    if (!menu) return state

    const updatedSections = menu.sections.map((section) => {
      if (section.id !== action.sectionId) return section

      return {
        ...section,
        items: section.items.filter((item) => item.id !== action.itemId)
      }
    })

    return {
      ...state,
      [action.menuKey]: { ...menu, sections: updatedSections }
    }
  }

  if (action.type === 'REMOVE_MENU_TREE') {
    const entries = Object.entries(state)
    const prefix = `${action.menuKey}/`

    const filteredEntries = entries.filter(([key]) => {
      if (key === ROOT_MENU_KEY) return true
      if (key === action.menuKey) return false
      return !key.startsWith(prefix)
    })

    return Object.fromEntries(filteredEntries)
  }

  return state
}

function ensureMenuExists(state: RegistryState, menuKey: MenuKey) {
  if (state[menuKey]) return null

  return {
    [menuKey]: {
      key: menuKey,
      sections: []
    }
  }
}

function upsertSection(
  sections: ActionSectionState[],
  section: Pick<ActionSectionState, 'id' | 'title' | 'subtitle' | 'order'>
): ActionSectionState[] {
  const index = sections.findIndex((entry) => entry.id === section.id)

  if (index !== -1) {
    const updated = sections.map((entry, position) =>
      position === index
        ? {
            ...entry,
            title: section.title,
            subtitle: section.subtitle,
            order: section.order ?? entry.order
          }
        : entry
    )

    return sortSections(updated)
  }

  return sortSections([...sections, { ...section, items: [], order: section.order }])
}

function upsertItem(items: ActionNode[], item: ActionNode) {
  const index = items.findIndex((entry) => entry.id === item.id)

  if (index !== -1) {
    const updated = items.map((entry, position) =>
      position === index ? { ...item, order: item.order ?? entry.order } : entry
    )

    return sortItems(updated)
  }

  return sortItems([...items, item])
}

function getOrCreateSection(sections: ActionSectionState[], sectionId: string) {
  const existing = sections.find((section) => section.id === sectionId)
  if (existing) return existing

  const newSection: ActionSectionState = {
    id: sectionId,
    items: [],
    order: sections.length + 1
  }

  sections.push(newSection)
  return newSection
}

function sortSections(sections: ActionSectionState[]) {
  return [...sections].sort((left, right) => left.order - right.order)
}

function sortItems(items: ActionNode[]) {
  return [...items].sort((left, right) => (left.order ?? 0) - (right.order ?? 0))
}
