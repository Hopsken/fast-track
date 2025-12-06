import { createElement } from 'react'
import { CommandItem } from '@internal/ui/components/command'
import { LucideIcon } from 'lucide-react'

import { KeyboardShortcut } from '@/lib/keyboard'

import { ActionShortcut } from './ActionShortcut'

export interface ActionProps {
  icon: LucideIcon
  title: string
  onSelect?: () => void
  shortcut?: KeyboardShortcut
}

export function Action({ icon, title, onSelect, shortcut }: ActionProps) {
  const iconEl = createElement(icon, { size: 16 })
  return (
    <CommandItem tabIndex={0} role="button" onSelect={onSelect}>
      <span>{iconEl}</span>

      <div className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap">
        {title}
      </div>

      {shortcut && <ActionShortcut shortcut={shortcut} />}
    </CommandItem>
  )
}
