import { useClickAway, useMemoizedFn } from 'ahooks'
import { useRef, useState } from 'react'
import { HotkeyCallback, HotkeysProvider, useHotkeys } from 'react-hotkeys-hook'
import { HiClipboardCopy } from 'react-icons/hi'

import { isPressingHotKey } from '@/lib/hotkey'
import type { JiraTicket } from '@/types'
import { ActionPanel } from '~/components/ui/action-panel/ActionPanel'
import {
  type ActionShortcut,
  type ShortcutModifier
} from '~/components/ui/action-panel/types'

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

  const actionsMenuRef = useRef<HTMLDivElement>(null)
  const actionButtonRef = useRef<HTMLButtonElement>(null)

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

  useHotkeys(
    ['escape'],
    () => {
      if (!isActionsOpen) return
      closeMenu()
    },
    { enabled: isActionsOpen, enableOnFormTags: true }
  )

  // Close the menu when clicking outside
  useClickAway(() => {
    if (!isActionsOpen) return
    closeMenu()
  }, [actionsMenuRef, actionButtonRef])

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
          className="actions-menu-animate glass rounded-box absolute right-0 bottom-10 z-20">
          <ActionPanel
            title={selectedTicket.key}
            description={selectedTicket.summary}
            emptyMessage="No results"
            className="h-60 w-80"
            searchPlaceholder="Search for actions..."
            onClose={closeMenu}
            autoFocusSearch={isActionsOpen}>
            <ActionPanel.Section title="Actions">
              {ACTION_DEFINITIONS.map((action) => (
                <ActionPanel.Action
                  key={action.id}
                  title={action.label}
                  shortcut={toShortcut(action.shortcut)}
                  icon={<HiClipboardCopy className="h-4 w-4 opacity-70" />}
                  onAction={() => performAction(action.id)}
                />
              ))}
            </ActionPanel.Section>
          </ActionPanel>
        </div>
      ) : null}
    </div>
  )
}

function toShortcut(shortcut: string): ActionShortcut {
  const parts = shortcut.split('+')
  const key = parts.pop() ?? ''
  const modifiers = parts
    .map(normalizeModifier)
    .filter((value): value is ShortcutModifier => Boolean(value))

  return { key, modifiers }
}

function normalizeModifier(modifier: string): ShortcutModifier | null {
  const normalized = modifier.toLowerCase()
  if (normalized === 'mod') return 'cmd'
  if (normalized === 'ctrl') return 'ctrl'
  if (normalized === 'cmd') return 'cmd'
  if (normalized === 'opt') return 'opt'
  if (normalized === 'shift') return 'shift'
  return null
}
