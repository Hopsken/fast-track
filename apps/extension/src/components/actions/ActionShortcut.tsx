import { CommandShortcut } from '@internal/ui/components/command'
import { Kbd, KbdGroup } from '@internal/ui/components/kbd'

import { useActionShortcut } from '@/hooks/useActionShortcut'
import {
  detectPlatformOS,
  KeyboardShortcutInput,
  KeyModifier,
  PlatformOS,
  resolvePlatformShortcut
} from '@/lib/keyboard'

const mapModifiers = (modifier: KeyModifier, platform: PlatformOS) =>
  platform === 'Windows'
    ? mapWindowsModifier(modifier)
    : mapMacModifier(modifier)

const mapWindowsModifier = (modifier: KeyModifier) => {
  switch (modifier) {
    case 'cmd':
    case 'windows':
      return '⊞'
    case 'ctrl':
      return 'Ctrl'
    case 'shift':
      return 'Shift'
    case 'opt':
    case 'alt':
      return 'Alt'
    default:
      return modifier
  }
}

const mapMacModifier = (modifier: KeyModifier) => {
  switch (modifier) {
    case 'ctrl':
      return '⌃'
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
  shortcut: KeyboardShortcutInput
  onSelect: () => void
}) {
  const platform = detectPlatformOS()
  const resolvedShortcut = resolvePlatformShortcut(shortcut, platform)

  useActionShortcut(resolvedShortcut, onSelect)
  return (
    <CommandShortcut>
      <KbdGroup>
        {resolvedShortcut.modifiers.map((modifier) => (
          <Kbd key={modifier}>{mapModifiers(modifier, platform)}</Kbd>
        ))}
      </KbdGroup>
      <Kbd key={resolvedShortcut.key}>{resolvedShortcut.key}</Kbd>
    </CommandShortcut>
  )
}
