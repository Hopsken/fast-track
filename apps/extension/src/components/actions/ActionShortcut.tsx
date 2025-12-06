import { CommandShortcut } from '@internal/ui/components/command'

import { KeyboardShortcut, KeyModifier } from '@/lib/keyboard'

const mapModifiers = (modifier: KeyModifier) => {
  switch (modifier) {
    case 'ctrl':
      return 'Ctrl'
    case 'shift':
      return '⇧'
    case 'opt':
    case 'alt':
      return '⌥'
    case 'cmd':
      return '⌘'
    case 'windows':
      return '⊞'
    default:
      return modifier
  }
}

export function ActionShortcut({ shortcut }: { shortcut: KeyboardShortcut }) {
  return (
    <CommandShortcut>
      {shortcut.modifiers.map((modifier) => (
        <kbd key={modifier}>{mapModifiers(modifier)}</kbd>
      ))}
      <kbd key={shortcut.key}>{shortcut.key}</kbd>
    </CommandShortcut>
  )
}
