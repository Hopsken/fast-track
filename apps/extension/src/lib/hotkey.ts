import { partition } from 'lodash-es'
import type { Hotkey } from 'react-hotkeys-hook/packages/react-hotkeys-hook/dist/types'

const modifiers = ['alt', 'ctrl', 'meta', 'shift', 'mod'] as const

const modifierSet = new Set(modifiers)
const isModifier = (key: string): key is Modifier =>
  modifierSet.has(key as Modifier)

type Modifier = (typeof modifiers)[number]

const isPressingHotKeyHelper = (hotkey: Hotkey, expect: string): boolean => {
  // format: mod+shift+keys
  const expectKeys = expect.split('+')
  const [expectModifiers, expectKeysWithoutModifiers] = partition(
    expectKeys,
    isModifier
  )

  const hasAllModifiers = expectModifiers.every((modifier) => hotkey[modifier])
  const hasAllKeys = expectKeysWithoutModifiers.every(
    (key) => hotkey.keys?.includes(key) ?? false
  )

  return hasAllModifiers && hasAllKeys
}

export const isPressingHotKey = (
  hotkey: Hotkey,
  expect: string | string[]
): boolean => {
  if (Array.isArray(expect)) {
    return expect.some((e) => isPressingHotKeyHelper(hotkey, e))
  }
  return isPressingHotKeyHelper(hotkey, expect)
}
