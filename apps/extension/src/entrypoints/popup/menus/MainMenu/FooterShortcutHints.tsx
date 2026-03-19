import { useRef } from 'react'
import { Kbd } from '@internal/ui/components/kbd'

export interface ShortcutHint {
  keys: string[]
  label: string
}

interface FooterShortcutHintsProps {
  hints: ShortcutHint[]
}

export function FooterShortcutHints({ hints }: FooterShortcutHintsProps) {
  const index = useRef(Math.floor(Math.random() * Math.max(hints.length, 1)))
  const hint = hints[index.current]
  if (!hint) return null

  return (
    <div className="flex items-center gap-1.5 opacity-60">
      {hint.keys.map((key) => (
        <Kbd key={key}>{key}</Kbd>
      ))}
      <span className="text-muted-foreground text-[11px]">{hint.label}</span>
    </div>
  )
}
