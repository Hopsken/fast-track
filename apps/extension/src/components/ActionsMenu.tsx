import { useClickAway, useMemoizedFn } from 'ahooks'
import { useEffect, useMemo, useRef, useState } from 'react'
import { HotkeysProvider, useHotkeys } from 'react-hotkeys-hook'
import { HiClipboardCopy } from 'react-icons/hi'

import type { JiraTicket } from '@/types'

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
  const [actionQuery, setActionQuery] = useState('')
  const [activeActionIndex, setActiveActionIndex] = useState(0)

  const actionInputRef = useRef<HTMLInputElement>(null)
  const actionsMenuRef = useRef<HTMLDivElement>(null)
  const actionButtonRef = useRef<HTMLButtonElement>(null)

  const actions = useMemo(
    () => [
      {
        id: 'copy-ticket-key',
        label: 'Copy ticket key',
        perform: () => {
          navigator.clipboard.writeText(selectedTicket.key)
        }
      },
      {
        id: 'copy-ticket-title',
        label: 'Copy ticket title',
        perform: () => {
          navigator.clipboard.writeText(selectedTicket.summary)
        }
      }
    ],
    [selectedTicket]
  )

  const filteredActions = useMemo(() => {
    const normalizedQuery = actionQuery.trim().toLowerCase()
    if (!normalizedQuery) return actions
    return actions.filter((action) =>
      action.label.toLowerCase().includes(normalizedQuery)
    )
  }, [actions, actionQuery])

  useEffect(() => {
    setActiveActionIndex((current) =>
      Math.min(current, Math.max(filteredActions.length - 1, 0))
    )
  }, [filteredActions.length])

  const closeMenu = useMemoizedFn(() => {
    setIsActionsOpen(false)
    onClose?.()
  })

  const toggleActionsMenu = useMemoizedFn(() => {
    setIsActionsOpen((prev) => {
      const next = !prev
      if (next) {
        setActionQuery('')
        setActiveActionIndex(0)
      } else {
        onClose?.()
      }
      return next
    })
  })

  // Global hotkey for opening the actions menu (Cmd/Ctrl + K)
  useHotkeys(['cmd+k', 'ctrl+k'], toggleActionsMenu, {
    preventDefault: true,
    enableOnFormTags: ['INPUT']
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

  // Keyboard navigation inside the menu
  useHotkeys(
    ['arrowdown', 'ctrl+n'],
    (event) => {
      event.preventDefault()
      setActiveActionIndex((prev) =>
        Math.min(prev + 1, Math.max(filteredActions.length - 1, 0))
      )
    },
    {
      enabled: isActionsOpen,
      enableOnFormTags: true,
      scopes: ['actions']
    },
    [filteredActions.length, isActionsOpen]
  )

  useHotkeys(
    ['arrowup', 'ctrl+p'],
    (event) => {
      event.preventDefault()
      setActiveActionIndex((prev) => Math.max(prev - 1, 0))
    },
    {
      enabled: isActionsOpen,
      enableOnFormTags: true,
      scopes: ['actions']
    },
    [isActionsOpen]
  )

  useHotkeys(
    ['enter'],
    (event) => {
      event.preventDefault()
      const action = filteredActions[activeActionIndex]
      if (action) {
        action.perform()
        closeMenu()
      }
    },
    {
      enabled: isActionsOpen,
      enableOnFormTags: true,
      scopes: ['actions']
    },
    [activeActionIndex, filteredActions, isActionsOpen]
  )

  useHotkeys(
    ['escape'],
    (event) => {
      event.preventDefault()
      closeMenu()
    },
    {
      enabled: isActionsOpen,
      enableOnFormTags: true,
      scopes: ['actions']
    },
    [isActionsOpen]
  )

  return (
    <div
      className={`dropdown dropdown-end ${isActionsOpen ? 'dropdown-open' : ''} relative`}>
      <button
        ref={actionButtonRef}
        onClick={toggleActionsMenu}
        className="btn btn-ghost btn-xs h-auto min-h-0 gap-2 rounded-md px-3 py-2 text-[11px] font-semibold normal-case"
        title="Open actions (Cmd+K)">
        <span className="tracking-wide">Actions</span>
        <span className="kbd kbd-xs font-semibold">⌘K</span>
      </button>

      {isActionsOpen ? (
        <div
          ref={actionsMenuRef}
          className="dropdown-content menu bg-base-100 absolute right-0 bottom-12 z-20 w-80 rounded-2xl border shadow-xl">
          <div className="flex h-72 flex-col">
            <div className="space-y-1 border-b px-4 py-3">
              <div className="text-base-content/70 text-xs font-semibold">
                Quick actions
              </div>
              <div className="text-base-content/60 flex items-center justify-between text-xs">
                <span className="font-semibold">{selectedTicket.key}</span>
                <span className="kbd kbd-xs font-semibold uppercase">
                  Enter
                </span>
              </div>
            </div>

            <ul className="menu menu-sm flex-1 gap-2 overflow-y-auto px-2 py-2">
              {filteredActions.length === 0 ? (
                <li className="w-full">
                  <div className="alert alert-ghost border border-dashed px-3 py-4 text-center text-[11px] font-medium">
                    No actions match “{actionQuery}”
                  </div>
                </li>
              ) : (
                filteredActions.map((action, index) => {
                  const isActive = index === activeActionIndex

                  return (
                    <li key={action.id} className="w-full">
                      <button
                        onMouseEnter={() => setActiveActionIndex(index)}
                        onClick={() => {
                          action.perform()
                          closeMenu()
                        }}
                        className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition-colors duration-150 ${
                          isActive
                            ? 'bg-base-200 text-base-content'
                            : 'bg-base-100 text-base-content hover:bg-base-200'
                        }`}>
                        <div className="flex items-center gap-2">
                          <HiClipboardCopy className="h-4 w-4 opacity-70" />
                          <span className="font-semibold">{action.label}</span>
                        </div>
                        <span className="kbd kbd-xs font-semibold uppercase">
                          ↵
                        </span>
                      </button>
                    </li>
                  )
                })
              )}
            </ul>

            <div className="border-t px-3 py-2">
              <div className="input input-bordered focus-within:ring-base-200 flex items-center gap-2 rounded-lg px-3 py-2 text-xs focus-within:ring-1">
                <input
                  ref={actionInputRef}
                  value={actionQuery}
                  onChange={(event) => setActionQuery(event.target.value)}
                  placeholder="Search for actions..."
                  className="placeholder-base-content/50 w-full border-0 bg-transparent px-0 text-sm font-medium focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
