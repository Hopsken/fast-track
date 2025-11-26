import {
  type KeyboardEvent,
  type ReactElement,
  type ReactNode,
  Children,
  useCallback,
  useEffect,
  useMemo,
  useState
} from 'react'

import { cn } from '~/lib/utils'

export type ShortcutModifier = 'cmd' | 'ctrl' | 'opt' | 'shift'

export interface ActionShortcut {
  modifiers?: ShortcutModifier[]
  key: string
}

interface ActionPanelProps {
  title?: string
  description?: string
  emptyMessage?: string
  className?: string
  children: ReactNode
}

interface ActionSectionProps {
  id?: string
  title?: string
  subtitle?: string
  children: ReactNode
}

interface ActionProps {
  id?: string
  title: string
  subtitle?: string
  shortcut?: ActionShortcut
  icon?: ReactNode
  onAction: () => void
}

interface SubmenuProps {
  id?: string
  title: string
  subtitle?: string
  shortcut?: ActionShortcut
  icon?: ReactNode
  children: ReactNode
}

type ActionNodeAction = ActionProps & { type: 'action' }
type ActionNodeSubmenu = Omit<SubmenuProps, 'children'> & {
  type: 'submenu'
  sections: ActionSectionNode[]
}

type ActionNode = ActionNodeAction | ActionNodeSubmenu

interface ActionSectionNode {
  id: string
  title?: string
  subtitle?: string
  items: ActionNode[]
}

type SectionElement = ReactElement<
  ActionSectionProps,
  typeof ActionPanelSection
>
type ActionElement = ReactElement<ActionProps, typeof Action>
type SubmenuElement = ReactElement<SubmenuProps, typeof ActionPanelSubmenu>

type FlattenedItem = {
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
  const sections = useMemo(() => collectSections(children), [children])

  const [activePath, setActivePath] = useState<string[]>([])
  const [activeIndexByMenu, setActiveIndexByMenu] = useState<
    Record<string, number>
  >({
    root: 0
  })

  const currentKey = activePath.length ? activePath.join('/') : 'root'
  const currentSections = useMemo(
    () => getSectionsForPath(sections, activePath),
    [activePath, sections]
  )

  const flattenedItems = useMemo(
    () => flattenSections(currentSections),
    [currentSections]
  )

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
      if (node.type !== 'submenu' || node.sections.length === 0) return

      const nextPath = [...activePath, node.id ?? node.title]
      setActivePath(nextPath)
      setActiveIndexByMenu((previous) => ({
        ...previous,
        [nextPath.join('/')]: 0
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

  return (
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
            <section
              key={section.id}
              className="border-base-300 bg-base-100 overflow-hidden rounded-xl border shadow-sm">
              {(section.title || section.subtitle) && (
                <header className="border-base-200 bg-base-200/60 border-b px-4 py-2">
                  <p className="text-base-content text-sm font-semibold">
                    {section.title ?? 'Actions'}
                  </p>
                  {section.subtitle && (
                    <p className="text-base-content/70 text-xs">
                      {section.subtitle}
                    </p>
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
                            [currentKey]:
                              flattenedIndex === -1 ? 0 : flattenedIndex
                          }))
                        }
                        onClick={() => handleAction(item)}
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
                          {item.shortcut && (
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
          ))}
        </div>
      )}
    </div>
  )
}

export function ActionPanelSection(_props: ActionSectionProps) {
  return null
}

ActionPanelSection.displayName = 'ActionPanel.Section'

export function ActionPanelSubmenu(_props: SubmenuProps) {
  return null
}

ActionPanelSubmenu.displayName = 'ActionPanel.Submenu'

export function Action(_props: ActionProps) {
  return null
}

Action.displayName = 'ActionPanel.Action'

function collectSections(children: ReactNode) {
  const elements = Children.toArray(children)
  const sections: ActionSectionNode[] = []
  let implicitActions: ActionNode[] = []

  elements.forEach((child, index) => {
    if (
      !isValidSectionElement(child) &&
      !isValidActionElement(child) &&
      !isValidSubmenuElement(child)
    ) {
      return
    }

    if (isValidActionElement(child) || isValidSubmenuElement(child)) {
      const node = createActionNode(
        child,
        `root-implicit-${implicitActions.length}`
      )
      implicitActions.push(node)
      return
    }

    if (!isValidSectionElement(child)) return

    if (implicitActions.length) {
      sections.push({
        id: `implicit-section-${sections.length}`,
        items: implicitActions
      })
      implicitActions = []
    }

    sections.push({
      id: child.props.id ?? `section-${sections.length}-${index}`,
      title: child.props.title,
      subtitle: child.props.subtitle,
      items: collectItems(child.props.children, `section-${sections.length}`)
    })
  })

  if (implicitActions.length) {
    sections.push({
      id: `implicit-section-${sections.length}`,
      items: implicitActions
    })
  }

  return sections
}

function collectItems(children: ReactNode, prefix: string): ActionNode[] {
  const elements = Children.toArray(children)
  const items: ActionNode[] = []

  elements.forEach((child, index) => {
    if (!isValidActionElement(child) && !isValidSubmenuElement(child)) return

    const node = createActionNode(child, `${prefix}-item-${index}`)
    items.push(node)
  })

  return items
}

function createActionNode(
  element: ActionElement | SubmenuElement,
  fallbackId: string
): ActionNode {
  if (isValidActionElement(element)) {
    return {
      type: 'action',
      id: element.props.id ?? fallbackId,
      title: element.props.title,
      subtitle: element.props.subtitle,
      shortcut: element.props.shortcut,
      onAction: element.props.onAction,
      icon: element.props.icon
    }
  }

  return {
    type: 'submenu',
    id: element.props.id ?? fallbackId,
    title: element.props.title,
    subtitle: element.props.subtitle,
    shortcut: element.props.shortcut,
    icon: element.props.icon,
    sections: collectSections(element.props.children)
  }
}

function isValidSectionElement(child: unknown): child is SectionElement {
  return Boolean(
    typeof child === 'object' &&
      child !== null &&
      'type' in child &&
      (child as ReactElement).type === ActionPanelSection
  )
}

function isValidActionElement(child: unknown): child is ActionElement {
  return Boolean(
    typeof child === 'object' &&
      child !== null &&
      'type' in child &&
      (child as ReactElement).type === Action
  )
}

function isValidSubmenuElement(child: unknown): child is SubmenuElement {
  return Boolean(
    typeof child === 'object' &&
      child !== null &&
      'type' in child &&
      (child as ReactElement).type === ActionPanelSubmenu
  )
}

function getSectionsForPath(
  sections: ActionSectionNode[],
  path: string[]
): ActionSectionNode[] {
  if (!path.length) return sections

  let currentSections = sections

  for (const submenuId of path) {
    const submenu = findSubmenu(currentSections, submenuId)
    if (!submenu) return []
    currentSections = submenu.sections
  }

  return currentSections
}

function findSubmenu(
  sections: ActionSectionNode[],
  submenuId: string
): Extract<ActionNode, { type: 'submenu' }> | undefined {
  for (const section of sections) {
    for (const item of section.items) {
      if (item.type === 'submenu' && item.id === submenuId) {
        return item
      }
    }
  }

  return undefined
}

function flattenSections(sections: ActionSectionNode[]): FlattenedItem[] {
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

function ShortcutPill({ shortcut }: { shortcut: ActionShortcut }) {
  const keys = [...(shortcut.modifiers ?? []), shortcut.key]

  return (
    <div className="flex items-center gap-1">
      {keys.map((key) => (
        <kbd
          key={key}
          className="border-base-300 bg-base-100 text-base-content/80 rounded-md border px-1.5 py-0.5 text-[11px] font-semibold uppercase">
          {formatShortcutKey(key)}
        </kbd>
      ))}
    </div>
  )
}

function formatShortcutKey(key: string) {
  const mapping: Record<string, string> = {
    cmd: '⌘',
    ctrl: '⌃',
    opt: '⌥',
    option: '⌥',
    shift: '⇧'
  }

  return mapping[key.toLowerCase()] ?? key.toUpperCase()
}
