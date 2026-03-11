import { useEffect, useRef, useState } from 'react'
import { Kbd } from '@internal/ui/components/kbd'

export interface ShortcutHint {
  keys: string[]
  label: string
}

interface FooterShortcutHintsProps {
  hints: ShortcutHint[]
}

type Phase = 'visible' | 'exiting' | 'entering'

const INTERVAL_MS = 4000
const TRANSITION_MS = 300

function getPhaseStyle(phase: Phase): React.CSSProperties {
  if (phase === 'exiting') {
    return {
      opacity: 0,
      transform: 'translateY(-4px)',
      transition: `opacity ${TRANSITION_MS}ms ease-out, transform ${TRANSITION_MS}ms ease-out`
    }
  }
  if (phase === 'entering') {
    return { opacity: 0, transform: 'translateY(4px)', transition: 'none' }
  }
  return {
    opacity: 1,
    transform: 'translateY(0)',
    transition: `opacity ${TRANSITION_MS}ms ease-out, transform ${TRANSITION_MS}ms ease-out`
  }
}

export function FooterShortcutHints({ hints }: FooterShortcutHintsProps) {
  // Random start: use ref so it's stable across re-renders and initialised once.

  const initialIndex = useRef(
    Math.floor(Math.random() * Math.max(hints.length, 1))
  )
  const [activeIndex, setActiveIndex] = useState(initialIndex.current)
  const [phase, setPhase] = useState<Phase>('visible')

  useEffect(() => {
    if (hints.length <= 1) return

    function startExiting() {
      setPhase('exiting')
      setTimeout(startEntering, TRANSITION_MS)
    }

    function startEntering() {
      setActiveIndex((i) => (i + 1) % hints.length)
      setPhase('entering')
      setTimeout(showVisible, TRANSITION_MS)
    }

    function showVisible() {
      setPhase('visible')
    }

    const timer = setInterval(startExiting, INTERVAL_MS)
    return () => clearInterval(timer)
  }, [hints.length])

  const hint = hints[activeIndex]
  if (!hint) return null

  return (
    <div
      className="flex items-center gap-1.5 opacity-60"
      style={getPhaseStyle(phase)}>
      {hint.keys.map((key) => (
        <Kbd key={key}>{key}</Kbd>
      ))}
      <span className="text-muted-foreground text-[11px]">{hint.label}</span>
    </div>
  )
}
