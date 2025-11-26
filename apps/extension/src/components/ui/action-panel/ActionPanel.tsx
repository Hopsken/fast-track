import {
  type Dispatch,
  type KeyboardEvent,
  type ReactNode,
  type SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react'

import { cn } from '~/lib/utils'

import { Action } from './action'
import { ActionPanelContext, SectionContext } from './ActionPanelContext'
import { ActionPanelSection } from './ActionPanelSection'
import { ActionPanelSubmenu } from './ActionPanelSubmenu'
import { menuKeyFromPath, useActionRegistry } from './registry'
import { ShortcutPill } from './ShortcutPill'
import { type ActionNode, type ActionSectionState, type MenuKey } from './types'

interface ActionPanelProps {
  title?: string
  description?: string
  emptyMessage?: string
  className?: string
  children: ReactNode
}

interface FlattenedItem {
  node: ActionNode
  sectionId: string
}

export function ActionPanel({
  title,
  description,
  children,
  className = '',
  emptyMessage = 'No actions available'
}: ActionPanelProps) {
  const { menus, registerSection, registerAction, registerSubmenu } =
    useActionRegistry()
  // We track ordering per menu at render time so registrations always mirror
  // the traversal order of the rendered component tree. This keeps the menu
  // resilient when callers wrap actions/sections in other components.
  const sectionOrderRef = useRef<Record<MenuKey, number>>({})
  const itemOrderRef = useRef<Record<MenuKey, Record<string, number>>>({})

  sectionOrderRef.current = {}
  itemOrderRef.current = {}

  const claimSectionOrder = useCallback((menuKey: MenuKey) => {
    const next = (sectionOrderRef.current[menuKey] ?? 0) + 1
    sectionOrderRef.current[menuKey] = next
    return next
  }, [])

  const claimItemOrder = useCallback((menuKey: MenuKey, sectionId: string) => {
    const menuItems = itemOrderRef.current[menuKey] ?? {}
    const next = (menuItems[sectionId] ?? 0) + 1
    itemOrderRef.current[menuKey] = { ...menuItems, [sectionId]: next }
    return next
  }, [])

  const [activePath, setActivePath] = useState<string[]>([])
  const [activeIndexByMenu, setActiveIndexByMenu] = useState<
    Record<string, number>
  >({
    [menuKeyFromPath([])]: 0
  })

  const currentKey = menuKeyFromPath(activePath)
  const currentSections = useMemo(
    () => menus[currentKey]?.sections ?? [],
    [currentKey, menus]
  )

  const flattenedItems = useMemo(
    () => flattenSections(currentSections),
    [currentSections]
  )

  // Keep the active index valid even when a menu re-renders with a different
  // set of items (e.g. conditional children being added or removed).
  useEffect(() => {
    if (!flattenedItems.length) return

    setActiveIndexByMenu((previous) => ({
      ...previous,
      [currentKey]: Math.min(
        previous[currentKey] ?? 0,
        flattenedItems.length - 1
      )
    }))
  }, [currentKey, flattenedItems.length])

  const activeIndex = activeIndexByMenu[currentKey] ?? 0
  const activeItem = flattenedItems[activeIndex]

  const resetToRoot = useCallback(() => {
    setActivePath([])
  }, [])

  const openSubmenu = useCallback(
    (node: ActionNode) => {
      if (node.type !== 'submenu') return

      const nextPath = [...activePath, node.id ?? node.title]
      setActivePath(nextPath)
      setActiveIndexByMenu((previous) => ({
        ...previous,
        [menuKeyFromPath(nextPath)]: 0
      }))
    },
    [activePath]
  )

  const closeSubmenu = useCallback(() => {
    if (!activePath.length) return

    setActivePath((previous) => previous.slice(0, -1))
  }, [activePath.length])

  const handleAction = useCallback(
    (node: ActionNode) => {
      if (node.type === 'action') {
        node.onAction()
      } else {
        openSubmenu(node)
      }
    },
    [openSubmenu]
  )

  const moveSelection = useCallback(
    (direction: 1 | -1) => {
      if (!flattenedItems.length) return

      setActiveIndexByMenu((previous) => {
        const nextIndex = clampIndex(
          (previous[currentKey] ?? 0) + direction,
          flattenedItems.length
        )

        return {
          ...previous,
          [currentKey]: nextIndex
        }
      })
    },
    [currentKey, flattenedItems.length]
  )

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      if (event.key === 'ArrowDown') {
        event.preventDefault()
        moveSelection(1)
      }

      if (event.key === 'ArrowUp') {
        event.preventDefault()
        moveSelection(-1)
      }

      if (event.key === 'Enter' || event.key === 'ArrowRight') {
        event.preventDefault()
        if (activeItem) {
          handleAction(activeItem.node)
        }
      }

      if (event.key === 'ArrowLeft') {
        event.preventDefault()
        closeSubmenu()
      }

      if (event.key === 'Escape') {
        event.preventDefault()
        resetToRoot()
      }
    },
    [activeItem, closeSubmenu, handleAction, moveSelection, resetToRoot]
  )

  const breadcrumbs = useMemo(
    () => [title ?? 'Actions', ...activePath],
    [activePath, title]
  )

  const contextValue = useMemo(
    () => ({
      menuPath: [],
      registerSection,
      registerAction,
      registerSubmenu,
      claimSectionOrder,
      claimItemOrder
    }),
    [
      claimItemOrder,
      claimSectionOrder,
      registerAction,
      registerSection,
      registerSubmenu
    ]
  )

  return (
    <ActionPanelContext.Provider value={contextValue}>
      <div
        tabIndex={0}
        onKeyDown={handleKeyDown}
        role="menu"
        aria-orientation="vertical"
        aria-label={title ?? 'Action panel'}
        className={cn(
          'border-base-300 bg-base-100/70 text-base-content focus:ring-primary/50 flex flex-col gap-4 rounded-2xl border p-4 shadow-sm outline-none focus:ring-2',
          className
        )}>
        <div className="flex flex-col gap-1">
          <div className="text-base-content/70 flex items-center gap-2 text-sm font-semibold tracking-wide uppercase">
            {breadcrumbs.map((crumb, index) => (
              <span key={crumb} className="flex items-center gap-2">
                {index !== 0 && <span className="text-base-content/40">/</span>}
                <span>{crumb}</span>
              </span>
            ))}
          </div>
          {description && (
            <p className="text-base-content/80 text-sm">{description}</p>
          )}
          {activePath.length > 0 && (
            <button
              type="button"
              onClick={closeSubmenu}
              className="border-base-300 text-base-content/80 hover:border-base-400 hover:text-base-content flex w-fit items-center gap-2 rounded-lg border px-3 py-1 text-xs font-medium transition">
              ← Back
            </button>
          )}
        </div>

        {flattenedItems.length === 0 ? (
          <div className="border-base-300 bg-base-100 text-base-content/70 flex flex-1 items-center justify-center rounded-xl border border-dashed p-8 text-sm">
            {emptyMessage}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {currentSections.map((section) => (
              <ActionSection
                key={section.id}
                section={section}
                flattenedItems={flattenedItems}
                activeIndex={activeIndex}
                currentKey={currentKey}
                onAction={handleAction}
                setActiveIndexByMenu={setActiveIndexByMenu}
              />
            ))}
          </div>
        )}

        <SectionContext.Provider value={undefined}>
          {children}
        </SectionContext.Provider>
      </div>
    </ActionPanelContext.Provider>
  )
}

function ActionSection({
  section,
  flattenedItems,
  activeIndex,
  currentKey,
  onAction,
  setActiveIndexByMenu
}: {
  section: ActionSectionState
  flattenedItems: FlattenedItem[]
  activeIndex: number
  currentKey: string
  onAction: (node: ActionNode) => void
  setActiveIndexByMenu: Dispatch<SetStateAction<Record<string, number>>>
}) {
  return (
    <section
      className="border-base-300 bg-base-100 overflow-hidden rounded-xl border shadow-sm"
      aria-label={section.title ?? 'Actions'}>
      {(section.title || section.subtitle) && (
        <header className="border-base-200 bg-base-200/60 border-b px-4 py-2">
          <p className="text-base-content text-sm font-semibold">
            {section.title ?? 'Actions'}
          </p>
          {section.subtitle && (
            <p className="text-base-content/70 text-xs">{section.subtitle}</p>
          )}
        </header>
      )}

      <ul className="divide-base-200 divide-y">
        {section.items.map((item) => {
          const flattenedIndex = flattenedItems.findIndex(
            (flattened) =>
              flattened.node.id === (item.id ?? item.title) &&
              flattened.sectionId === section.id
          )

          const isActive = flattenedIndex === activeIndex

          return (
            <li key={item.id ?? item.title}>
              <button
                type="button"
                onMouseEnter={() =>
                  setActiveIndexByMenu((previous) => ({
                    ...previous,
                    [currentKey]: flattenedIndex === -1 ? 0 : flattenedIndex
                  }))
                }
                onClick={() => onAction(item)}
                role="menuitem"
                className={cn(
                  'flex w-full items-center justify-between px-4 py-3 text-left transition',
                  isActive
                    ? 'bg-primary/10 text-base-content'
                    : 'hover:bg-base-200'
                )}>
                <div className="flex items-center gap-3">
                  <div className="border-base-300 bg-base-100 text-base-content/70 flex h-9 w-9 items-center justify-center rounded-lg border">
                    {item.icon ?? <span className="text-base">⌘</span>}
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-base-content text-sm leading-none font-semibold">
                      {item.title}
                    </p>
                    {item.subtitle && (
                      <p className="text-base-content/70 text-xs">
                        {item.subtitle}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {'shortcut' in item && item.shortcut && (
                    <ShortcutPill shortcut={item.shortcut} />
                  )}
                  {item.type === 'submenu' && (
                    <span className="text-base-content/60">↵</span>
                  )}
                </div>
              </button>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

function flattenSections(sections: ActionSectionState[]): FlattenedItem[] {
  const flattened: FlattenedItem[] = []

  sections.forEach((section) => {
    section.items.forEach((item) => {
      flattened.push({
        node: item,
        sectionId: section.id
      })
    })
  })

  return flattened
}

function clampIndex(nextIndex: number, total: number) {
  if (total === 0) return 0

  if (nextIndex < 0) return total - 1
  if (nextIndex >= total) return 0

  return nextIndex
}

ActionPanel.Section = ActionPanelSection
ActionPanel.Submenu = ActionPanelSubmenu
ActionPanel.Action = Action
