import { Keys, useHotkeys } from 'react-hotkeys-hook'

import {
  KeyboardShortcut,
  KeyboardShortcutInput,
  KeyModifier,
  resolvePlatformShortcut
} from '@/lib/keyboard'

const mapModifierKey = (modifier: KeyModifier) => {
  if (modifier === 'cmd') {
    return 'meta'
  }
  return modifier
}

const mapKeyboardShortcutToReactHotkeys = (
  shortcut: KeyboardShortcut
): Keys => {
  return `${shortcut.modifiers.map(mapModifierKey).join('+')}+${shortcut.key}`
}

export function useActionShortcut(
  hotkeys: KeyboardShortcutInput,
  callback: () => void,
  enabled = true
) {
  const shortcut = resolvePlatformShortcut(hotkeys)
  const keys = mapKeyboardShortcutToReactHotkeys(shortcut)
  useHotkeys(keys, callback, {
    preventDefault: true,
    enableOnFormTags: true,
    enabled
  })
}
