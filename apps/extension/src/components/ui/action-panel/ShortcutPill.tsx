import { type ActionShortcut } from './types'

export function ShortcutPill({ shortcut }: { shortcut: ActionShortcut }) {
  const keys = [...(shortcut.modifiers ?? []), shortcut.key]

  return (
    <div className="flex items-center gap-1">
      {keys.map((key) => (
        <kbd
          key={key}
          className="border-base-300 bg-base-100 text-base-content/80 rounded-md border px-1.5 py-0.5 text-[11px] font-semibold uppercase">
          {formatShortcutKey(key)}
        </kbd>
      ))}
    </div>
  )
}

function formatShortcutKey(key: string) {
  const mapping: Record<string, string> = {
    cmd: '⌘',
    ctrl: '⌃',
    opt: '⌥',
    option: '⌥',
    shift: '⇧'
  }

  return mapping[key.toLowerCase()] ?? key.toUpperCase()
}
