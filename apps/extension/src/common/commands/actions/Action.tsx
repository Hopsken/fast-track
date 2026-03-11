import { createElement, ReactNode, useCallback } from 'react'
import { CommandItem } from '@internal/ui/components/command'
import { LucideIcon } from 'lucide-react'

import { HotkeyId } from '@/lib/hotkeys'

import { ActionShortcut } from '../ActionShortcut'
import { useNavigation } from '../navigation'

export interface ActionProps {
  value: string
  icon?: LucideIcon
  prefix?: ReactNode
  title: ReactNode
  description?: ReactNode
  keywords?: string[]
  onSelect?: () => void
  hotkeyId?: HotkeyId
  exitOnSelect?: boolean
}

export function Action({
  value,
  icon,
  prefix,
  title,
  description,
  keywords,
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
      keywords={keywords}
      onSelect={onSelectItem}>
      {prefixEl && (
        <span className={description ? 'mt-[2px] self-start' : undefined}>
          {prefixEl}
        </span>
      )}

      <div className="flex-1 overflow-hidden">
        <div className="text-ellipsis whitespace-nowrap">{title}</div>
        {description && (
          <div className="text-muted-foreground text-ellipsis whitespace-nowrap text-[11px]">
            {description}
          </div>
        )}
      </div>

      {hotkeyId && (
        <ActionShortcut hotkeyId={hotkeyId} onSelect={onSelectItem} />
      )}
    </CommandItem>
  )
}
