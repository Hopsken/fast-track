import { CommandShortcut } from '@internal/ui/components/command'
import { Kbd, KbdGroup } from '@internal/ui/components/kbd'

import { useActionShortcut } from '@/hooks/useActionShortcut'
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

export function ActionShortcut({
  shortcut,
  onSelect
}: {
  shortcut: KeyboardShortcut
  onSelect: () => void
}) {
  useActionShortcut(shortcut, onSelect)
  return (
    <CommandShortcut>
      <KbdGroup>
        {shortcut.modifiers.map((modifier) => (
          <Kbd key={modifier}>{mapModifiers(modifier)}</Kbd>
        ))}
      </KbdGroup>
      <Kbd key={shortcut.key}>{shortcut.key}</Kbd>
    </CommandShortcut>
  )
}
