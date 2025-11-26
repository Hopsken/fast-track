import { useClickAway, useMemoizedFn } from 'ahooks'
import { useEffect, useMemo, useRef, useState } from 'react'
import { HotkeyCallback, HotkeysProvider, useHotkeys } from 'react-hotkeys-hook'
import { HiClipboardCopy } from 'react-icons/hi'

import { isPressingHotKey } from '@/lib/hotkey'
import type { JiraTicket } from '@/types'

function copyToClipboard(value: string) {
  return navigator.clipboard.writeText(value)
}

interface ActionDefinition {
  id: string
  label: string
  shortcut: string
  perform: (ticket: JiraTicket) => void
}

function buildBranchName(ticket: JiraTicket) {
  const summarySlug = ticket.summary
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')

  if (!summarySlug) return ticket.key.toLowerCase()
  return `${ticket.key.toLowerCase()}-${summarySlug}`
}

const ACTION_DEFINITIONS: ActionDefinition[] = [
  {
    id: 'copy-ticket-key',
    label: 'Copy Issue Key',
    shortcut: 'mod+.',
    perform: (ticket) => {
      copyToClipboard(ticket.key)
    }
  },
  {
    id: 'copy-ticket-url',
    label: 'Copy Issue URL',
    shortcut: 'mod+shift+,',
    perform: (ticket) => {
      copyToClipboard(ticket.url)
    }
  },
  {
    id: 'copy-ticket-title',
    label: 'Copy Issue Title',
    shortcut: 'shift+.',
    perform: (ticket) => {
      copyToClipboard(ticket.summary)
    }
  },
  {
    id: 'copy-ticket-key-title',
    label: 'Copy Issue Key and Title',
    shortcut: 'mod+shift+.',
    perform: (ticket) => {
      copyToClipboard(`${ticket.key}: ${ticket.summary}`)
    }
  },
  {
    id: 'copy-git-branch',
    label: 'Copy Git Branch Name',
    shortcut: 'mod+shift+b',
    perform: (ticket) => {
      copyToClipboard(buildBranchName(ticket))
    }
  },
  {
    id: 'copy-markdown-link',
    label: 'Copy Markdown Link',
    shortcut: 'mod+shift+m',
    perform: (ticket) => {
      copyToClipboard(`[${ticket.key}: ${ticket.summary}](${ticket.url})`)
    }
  }
]

const ACTION_HOT_KEYS = ACTION_DEFINITIONS.map((item) => item.shortcut)

interface ActionsMenuProps {
  selectedTicket: JiraTicket
  onClose?: () => void
}

export function ActionsMenu(props: ActionsMenuProps) {
  return (
    <HotkeysProvider initiallyActiveScopes={['actions']}>
      <ActionsMenuContent {...props} />
    </HotkeysProvider>
  )
}

function ActionsMenuContent({ selectedTicket, onClose }: ActionsMenuProps) {
  const [isActionsOpen, setIsActionsOpen] = useState(false)
  const [menuMounted, setMenuMounted] = useState(false)
  const [menuState, setMenuState] = useState<'open' | 'closed'>('closed')
  const [actionQuery, setActionQuery] = useState('')
  const [activeActionIndex, setActiveActionIndex] = useState(0)

  const actionInputRef = useRef<HTMLInputElement>(null)
  const actionsMenuRef = useRef<HTMLDivElement>(null)
  const actionButtonRef = useRef<HTMLButtonElement>(null)

  const filteredActions = useMemo(() => {
    const normalizedQuery = actionQuery.trim().toLowerCase()
    if (!normalizedQuery) return ACTION_DEFINITIONS
    return ACTION_DEFINITIONS.filter((action) =>
      action.label.toLowerCase().includes(normalizedQuery)
    )
  }, [actionQuery])

  useEffect(() => {
    setActiveActionIndex((current) =>
      Math.min(current, Math.max(filteredActions.length - 1, 0))
    )
  }, [filteredActions.length])

  const closeMenu = useMemoizedFn(() => {
    setIsActionsOpen(false)
    setMenuState('closed')
    onClose?.()
    setTimeout(() => setMenuMounted(false), 180)
  })

  const toggleActionsMenu = useMemoizedFn(() => {
    setIsActionsOpen((prev) => {
      const next = !prev
      if (next) {
        setActionQuery('')
        setActiveActionIndex(0)
        setMenuMounted(true)
        setMenuState('open')
      } else {
        setMenuState('closed')
        onClose?.()
        setTimeout(() => setMenuMounted(false), 180)
      }
      return next
    })
  })

  const performAction = useMemoizedFn((id: string) => {
    const action = ACTION_DEFINITIONS.find((item) => item.id === id)
    if (!action) return
    action.perform(selectedTicket)
    closeMenu()
  })

  const performActionByHotKeys = useMemoizedFn<HotkeyCallback>((_, hotkeys) => {
    const action = ACTION_DEFINITIONS.find((item) =>
      isPressingHotKey(hotkeys, item.shortcut)
    )
    console.log({ action })
    if (!action) return
    performAction(action.id)
  })

  useHotkeys(ACTION_HOT_KEYS, performActionByHotKeys, {
    preventDefault: true,
    enableOnFormTags: true,
    scopes: ['actions']
  })

  // Global hotkey for opening the actions menu (Cmd/Ctrl + K)
  useHotkeys(['mod+k'], toggleActionsMenu, {
    enableOnFormTags: true
  })

  // Close the menu when clicking outside
  useClickAway(() => {
    if (!isActionsOpen) return
    closeMenu()
  }, [actionsMenuRef, actionButtonRef])

  // Focus the action input when menu opens
  useEffect(() => {
    if (!isActionsOpen) return
    const id = requestAnimationFrame(() => {
      actionInputRef.current?.focus()
    })
    return () => cancelAnimationFrame(id)
  }, [isActionsOpen])

  useHotkeys(
    ['enter', 'arrowdown', 'ctrl+n', 'arrowup', 'ctrl+p', 'escape'],
    (_, hotkeys) => {
      if (isPressingHotKey(hotkeys, 'enter')) {
        const action = filteredActions[activeActionIndex]
        if (action) {
          performAction(action.id)
        }
      }

      if (isPressingHotKey(hotkeys, ['arrowdown', 'ctrl+n'])) {
        setActiveActionIndex((prev) =>
          Math.min(prev + 1, Math.max(filteredActions.length - 1, 0))
        )
      }

      if (isPressingHotKey(hotkeys, ['arrowup', 'ctrl+p'])) {
        setActiveActionIndex((prev) => Math.max(prev - 1, 0))
      }

      if (isPressingHotKey(hotkeys, 'escape')) {
        closeMenu()
      }
    },
    {
      enabled: isActionsOpen,
      preventDefault: true,
      enableOnFormTags: true,
      scopes: ['actions']
    }
  )

  return (
    <div className={`relative font-medium`}>
      <button
        ref={actionButtonRef}
        onClick={toggleActionsMenu}
        className={`btn btn-ghost btn-xs gap-2 ${isActionsOpen ? 'btn-active' : ''}`}
        title="Open actions (Cmd+K)">
        <span className="tracking-wide">Actions</span>
        <span className="kbd kbd-xs font-semibold">⌘K</span>
      </button>

      {menuMounted ? (
        <div
          ref={actionsMenuRef}
          data-state={menuState}
          className="dropdown-content actions-menu-animate text-base-content border-base-200 glass rounded-box absolute right-0 bottom-10 z-20 w-80 border shadow-xl">
          <div className="flex h-60 flex-col">
            <div className="p-3">
              <span className="font-medium">{selectedTicket.key}</span>
            </div>

            <ul className="menu menu-sm w-full flex-1 flex-nowrap gap-2 overflow-y-auto border-t border-gray-200 px-2 py-2 font-medium">
              {filteredActions.length === 0 ? (
                <li className="w-full">
                  <div className="text-md text-center">No results</div>
                </li>
              ) : (
                filteredActions.map((action, index) => {
                  const isActive = index === activeActionIndex

                  return (
                    <li className="w-full" key={action.id}>
                      <button
                        onMouseEnter={() => setActiveActionIndex(index)}
                        onClick={() => performAction(action.id)}
                        className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm ${
                          isActive && 'menu-focus'
                        }`}>
                        <div className="flex items-center gap-2">
                          <HiClipboardCopy className="h-4 w-4 opacity-70" />
                          <span>{action.label}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="kbd kbd-xs uppercase">
                            {action.shortcut}
                          </span>
                        </div>
                      </button>
                    </li>
                  )
                })
              )}
            </ul>

            <div className="flex items-center border-t border-gray-200">
              <input
                ref={actionInputRef}
                value={actionQuery}
                onChange={(event) => setActionQuery(event.target.value)}
                placeholder="Search for actions..."
                className="input input-ghost placeholder-base-content/50 w-full border-0 py-2 pl-3 text-sm caret-current focus:bg-transparent focus:outline-none"
              />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
