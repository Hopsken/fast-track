export type PlatformOS = 'macOS' | 'Windows'

export type PlatformKeyboardShortcut = Record<PlatformOS, KeyboardShortcut>

export type KeyboardShortcut = {
  modifiers: KeyModifier[]
  key: KeyEquivalent
}

export type KeyboardShortcutInput = KeyboardShortcut | PlatformKeyboardShortcut

export type KeyModifier = 'cmd' | 'ctrl' | 'opt' | 'shift' | 'alt' | 'windows'

export type KeyEquivalent =
  | 'a'
  | 'b'
  | 'c'
  | 'd'
  | 'e'
  | 'f'
  | 'g'
  | 'h'
  | 'i'
  | 'j'
  | 'k'
  | 'l'
  | 'm'
  | 'n'
  | 'o'
  | 'p'
  | 'q'
  | 'r'
  | 's'
  | 't'
  | 'u'
  | 'v'
  | 'w'
  | 'x'
  | 'y'
  | 'z'
  | '0'
  | '1'
  | '2'
  | '3'
  | '4'
  | '5'
  | '6'
  | '7'
  | '8'
  | '9'
  | '.'
  | ','
  | ';'
  | '='
  | '+'
  | '-'
  | '['
  | ']'
  | '{'
  | '}'
  | '«'
  | '»'
  | '('
  | ')'
  | '/'
  | '\\'
  | "'"
  | '`'
  | '§'
  | '^'
  | '@'
  | '$'
  | 'return'
  | 'delete'
  | 'deleteForward'
  | 'tab'
  | 'arrowUp'
  | 'arrowDown'
  | 'arrowLeft'
  | 'arrowRight'
  | 'pageUp'
  | 'pageDown'
  | 'home'
  | 'end'
  | 'space'
  | 'escape'
  | 'enter'
  | 'backspace'

let cachedPlatform: PlatformOS | null = null

export const detectPlatformOS = (): PlatformOS => {
  if (cachedPlatform) {
    return cachedPlatform
  }

  if (typeof navigator === 'undefined') {
    cachedPlatform = 'macOS'
    return cachedPlatform
  }

  const platform = navigator.userAgent || navigator.platform || 'macOS'

  cachedPlatform = /win/i.test(platform) ? 'Windows' : 'macOS'
  return cachedPlatform
}

export const resolvePlatformShortcut = (
  shortcut: KeyboardShortcutInput,
  platform: PlatformOS = detectPlatformOS()
): KeyboardShortcut => {
  if ('modifiers' in shortcut) {
    return shortcut
  }

  return shortcut[platform]
}
