import { createElement, ReactNode, useCallback } from 'react'
import { CommandItem } from '@internal/ui/components/command'
import { useMemoizedFn } from 'ahooks'
import { LucideIcon } from 'lucide-react'

import { KeyboardShortcut } from '@/lib/keyboard'

import { useCommandRouter } from '../CommandRouter'

import { ActionShortcut } from './ActionShortcut'

export interface ActionProps {
  icon?: LucideIcon
  prefix?: ReactNode
  title: string
  onSelect?: () => void
  shortcut?: KeyboardShortcut
  exitOnSelect?: boolean
}

export function Action({
  icon,
  prefix,
  title,
  onSelect,
  shortcut,
  exitOnSelect = true
}: ActionProps) {
  const iconEl = icon ? createElement(icon, { size: 16 }) : null
  const router = useCommandRouter()
  const onSelectItem = useCallback(async () => {
    await onSelect?.()
    if (exitOnSelect) {
      router.pop()
    }
  }, [exitOnSelect, onSelect, router])

  return (
    <CommandItem tabIndex={0} role="button" onSelect={onSelectItem}>
      <span>{prefix ?? iconEl}</span>

      <div className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap">
        {title}
      </div>

      {shortcut && <ActionShortcut shortcut={shortcut} />}
    </CommandItem>
  )
}
