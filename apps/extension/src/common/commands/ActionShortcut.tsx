import { CommandShortcut as CommandShortcutComponent } from '@internal/ui/components/command'
import { Kbd, KbdGroup } from '@internal/ui/components/kbd'
import { useMemoizedFn } from 'ahooks'

import { getHotkeyDefinition, HotkeyId, useHotkey } from '@/lib/hotkeys'
import {
  detectPlatformOS,
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

const keyReplacements = {
  enter: '⏎'
} as const

const mapKey = (key: string): string => {
  return keyReplacements[key as keyof typeof keyReplacements] || key
}

export function ActionShortcut({
  hotkeyId,
  onSelect
}: {
  hotkeyId: HotkeyId
  onSelect?: () => void
}) {
  const platform = detectPlatformOS()
  const definition = getHotkeyDefinition(hotkeyId)
  const resolvedShortcut = resolvePlatformShortcut(
    definition.shortcut,
    platform
  )

  const onAction = useMemoizedFn(() => {
    onSelect?.()
  })

  // Register hotkey from registry
  useHotkey(hotkeyId, onAction, { enabled: !!onSelect })

  return (
    <CommandShortcutComponent>
      <KbdGroup>
        {resolvedShortcut.modifiers.map((modifier) => (
          <Kbd key={modifier}>{mapModifiers(modifier, platform)}</Kbd>
        ))}
      </KbdGroup>
      <Kbd key={resolvedShortcut.key}>{mapKey(resolvedShortcut.key)}</Kbd>
    </CommandShortcutComponent>
  )
}
