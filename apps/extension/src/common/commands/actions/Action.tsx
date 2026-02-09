import { createElement, ReactNode, useCallback } from 'react'
import { CommandItem } from '@internal/ui/components/command'
import { LucideIcon } from 'lucide-react'

import { HotkeyId } from '@/lib/hotkeys'

import { CommandShortcut } from '../CommandShortcut'
import { useNavigation } from '../navigation'

export interface ActionProps {
  value: string
  icon?: LucideIcon
  prefix?: ReactNode
  title: ReactNode
  onSelect?: () => void
  hotkeyId?: HotkeyId
  exitOnSelect?: boolean
}

export function Action({
  value,
  icon,
  prefix,
  title,
  onSelect,
  hotkeyId,
  exitOnSelect = true
}: ActionProps) {
  const iconEl = icon ? createElement(icon, { size: 16 }) : null

  const navigate = useNavigation()
  const onSelectItem = useCallback(async () => {
    await onSelect?.()
    if (exitOnSelect) {
      navigate.pop()
    }
  }, [exitOnSelect, navigate, onSelect])

  const prefixEl = prefix ?? iconEl

  return (
    <CommandItem
      value={value}
      tabIndex={0}
      role="button"
      onSelect={onSelectItem}>
      {prefixEl && <span>{prefixEl}</span>}

      <div className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap">
        {title}
      </div>

      {hotkeyId && (
        <CommandShortcut hotkeyId={hotkeyId} onSelect={onSelectItem} />
      )}
    </CommandItem>
  )
}
