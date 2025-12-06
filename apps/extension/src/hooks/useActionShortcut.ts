import { Keys, useHotkeys } from 'react-hotkeys-hook'

import { KeyboardShortcut, KeyModifier } from '@/lib/keyboard'

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
  hotkeys: KeyboardShortcut,
  callback: () => void
) {
  const keys = mapKeyboardShortcutToReactHotkeys(hotkeys)
  useHotkeys(keys, callback, {
    preventDefault: true,
    enableOnFormTags: true,
    useKey: true
  })
}
