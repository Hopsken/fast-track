import { createElement, ReactNode, useCallback } from 'react'
import { CommandItem } from '@internal/ui/components/command'
import { LucideIcon } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { KeyboardShortcutInput } from '@/lib/keyboard'

import { ActionShortcut } from './ActionShortcut'

export interface ActionProps {
  value: string
  icon?: LucideIcon
  prefix?: ReactNode
  title: ReactNode
  onSelect?: () => void
  shortcut?: KeyboardShortcutInput
  exitOnSelect?: boolean
}

export function Action({
  value,
  icon,
  prefix,
  title,
  onSelect,
  shortcut,
  exitOnSelect = true
}: ActionProps) {
  const iconEl = icon ? createElement(icon, { size: 16 }) : null

  const navigate = useNavigate()
  const onSelectItem = useCallback(async () => {
    await onSelect?.()
    if (exitOnSelect) {
      navigate(-1)
    }
  }, [exitOnSelect, navigate, onSelect])

  return (
    <CommandItem
      value={value}
      tabIndex={0}
      role="button"
      onSelect={onSelectItem}>
      <span>{prefix ?? iconEl}</span>

      <div className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap">
        {title}
      </div>

      {shortcut && (
        <ActionShortcut shortcut={shortcut} onSelect={onSelectItem} />
      )}
    </CommandItem>
  )
}
