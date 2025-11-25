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
  const [menuMounted, setMenuMounted] = useState(false)
  const [menuState, setMenuState] = useState<'open' | 'closed'>('closed')
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

  // Global hotkey for opening the actions menu (Cmd/Ctrl + K)
  useHotkeys(['meta+k', 'ctrl+k'], toggleActionsMenu, {
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

            <ul className="menu menu-sm w-full flex-1 gap-2 overflow-y-auto border-t border-gray-200 px-2 py-2 font-medium">
              {filteredActions.length === 0 ? (
                <li className="w-full">
                  <div className="text-md text-center">No results</div>
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
                        className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm ${
                          isActive && 'menu-focus'
                        }`}>
                        <div className="flex items-center gap-2">
                          <HiClipboardCopy className="h-4 w-4 opacity-70" />
                          <span>{action.label}</span>
                        </div>
                        <span className="kbd kbd-xs uppercase">↵</span>
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
