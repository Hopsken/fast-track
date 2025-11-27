import {
  type ComponentPropsWithoutRef,
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

interface ActionPanelProps
  extends Omit<ComponentPropsWithoutRef<'div'>, 'title'> {
  title?: string
  description?: string
  emptyMessage?: string
  className?: string
  searchPlaceholder?: string
  showSearch?: boolean
  onClose?: () => void
  autoFocusSearch?: boolean
  children: ReactNode
}

interface FlattenedItem {
  node: ActionNode
  sectionId: string
}

export function ActionPanel({
  title,
  children,
  className = '',
  emptyMessage = 'No actions available',
  searchPlaceholder = 'Search for actions...',
  showSearch = true,
  onClose,
  autoFocusSearch = false,
  ...divProps
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
  const [searchQuery, setSearchQuery] = useState('')
  const searchInputRef = useRef<HTMLInputElement>(null)

  const currentKey = menuKeyFromPath(activePath)
  const currentSections = useMemo(
    () => menus[currentKey]?.sections ?? [],
    [currentKey, menus]
  )
  const filteredSections = useMemo(
    () => filterSections(currentSections, searchQuery),
    [currentSections, searchQuery]
  )

  const flattenedItems = useMemo(
    () => flattenSections(filteredSections),
    [filteredSections]
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

  useEffect(() => {
    if (!autoFocusSearch || !showSearch) return

    const frame = requestAnimationFrame(() => {
      searchInputRef.current?.focus()
    })

    return () => cancelAnimationFrame(frame)
  }, [autoFocusSearch, showSearch])

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

      if (event.key.toLowerCase() === 'n' && event.ctrlKey) {
        event.preventDefault()
        moveSelection(1)
      }

      if (event.key === 'ArrowUp') {
        event.preventDefault()
        moveSelection(-1)
      }

      if (event.key.toLowerCase() === 'p' && event.ctrlKey) {
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
        if (searchQuery) {
          setSearchQuery('')
          return
        }

        if (activePath.length) {
          resetToRoot()
          return
        }

        onClose?.()
      }
    },
    [
      activeItem,
      activePath.length,
      closeSubmenu,
      handleAction,
      moveSelection,
      onClose,
      resetToRoot,
      searchQuery
    ]
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
        {...divProps}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        role="menu"
        aria-orientation="vertical"
        aria-label={title ?? 'Action panel'}
        className={cn(
          'text-base-content flex h-60 w-80 flex-col font-medium',
          className
        )}>
        <div className="flex flex-col gap-2 px-3 pb-2 pt-3">
          <div className="text-base-content/60 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.08em]">
            {breadcrumbs.map((crumb, index) => (
              <span key={crumb} className="flex items-center gap-2">
                {index !== 0 && (
                  <span className="text-base-content/40" aria-hidden>
                    /
                  </span>
                )}
                <span className="truncate">{crumb}</span>
              </span>
            ))}
          </div>

          {activePath.length > 0 && (
            <button
              type="button"
              onClick={closeSubmenu}
              className="btn btn-ghost btn-xs gap-1 self-start px-2">
              <span aria-hidden>←</span>
              Back
            </button>
          )}
        </div>

        {flattenedItems.length === 0 ? (
          <div className="text-base-content/70 flex flex-1 items-center justify-center px-4 text-sm">
            {searchQuery.trim() ? 'No results' : emptyMessage}
          </div>
        ) : (
          <div className="flex flex-1 flex-col overflow-hidden">
            <ul className="menu menu-sm border-base-200 w-full flex-1 flex-nowrap gap-1 overflow-y-auto border-t px-2 pb-2 pt-2 font-medium">
              {filteredSections.map((section) => (
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
            </ul>
          </div>
        )}

        {showSearch ? (
          <div className="border-base-200 flex items-center border-t px-2">
            <input
              ref={searchInputRef}
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder={searchPlaceholder}
              aria-label="Search actions"
              className="input input-ghost placeholder-base-content/60 w-full border-0 bg-transparent px-3 py-2 text-sm caret-current focus:bg-transparent focus:outline-none"
            />
          </div>
        ) : null}

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
  if (section.items.length === 0) return null

  return (
    <>
      {section.title && (
        <li
          className="text-base-content/60 px-2 pt-2 text-[11px] font-semibold uppercase tracking-[0.08em]"
          role="presentation">
          <div className="flex flex-col">
            <span className="truncate">{section.title ?? 'Actions'}</span>
          </div>
        </li>
      )}

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
                'flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition',
                isActive
                  ? 'menu-focus bg-base-200/80 text-base-content'
                  : 'hover:bg-base-200/60 focus-visible:bg-base-200/80'
              )}>
              <div className="flex items-center gap-3">
                <div className="text-base-content/70">
                  {item.icon ?? <span className="text-sm">⌘</span>}
                </div>
                <div className="space-y-0.5">
                  <p className="text-base-content text-sm font-semibold leading-none">
                    {item.title}
                  </p>
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
    </>
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

function filterSections(sections: ActionSectionState[], query: string) {
  const normalizedQuery = query.trim().toLowerCase()
  if (!normalizedQuery) return sections

  return sections
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => matchesQuery(item, normalizedQuery))
    }))
    .filter((section) => section.items.length > 0)
}

function matchesQuery(item: ActionNode, query: string) {
  const searchable = `${item.title}`.toLowerCase()
  return searchable.includes(query)
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
