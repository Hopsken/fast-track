import { render, screen, act } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { FooterShortcutHints, ShortcutHint } from './FooterShortcutHints'

const hints: ShortcutHint[] = [
  { keys: ['/'], label: 'Commands' },
  { keys: ['C'], label: 'New Issue' },
  { keys: ['⌘', '⇧', 'S'], label: 'Status' }
]

describe('FooterShortcutHints', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    // Pin Math.random so initial index is deterministic (index 0)
    vi.spyOn(Math, 'random').mockReturnValue(0)
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  it('renders the first hint on mount', () => {
    render(<FooterShortcutHints hints={hints} />)

    expect(screen.getByText('/')).toBeDefined()
    expect(screen.getByText('Commands')).toBeDefined()
  })

  it('cycles to the next hint after ~4s', () => {
    render(<FooterShortcutHints hints={hints} />)

    act(() => {
      vi.advanceTimersByTime(4000) // trigger interval → exiting phase
      vi.advanceTimersByTime(300) // entering phase
      vi.advanceTimersByTime(300) // visible phase
    })

    expect(screen.getByText('C')).toBeDefined()
    expect(screen.getByText('New Issue')).toBeDefined()
  })

  it('renders all keys from a hint', () => {
    render(
      <FooterShortcutHints
        hints={[{ keys: ['⌘', '⇧', 'S'], label: 'Status' }]}
      />
    )

    expect(screen.getByText('⌘')).toBeDefined()
    expect(screen.getByText('⇧')).toBeDefined()
    expect(screen.getByText('S')).toBeDefined()
    expect(screen.getByText('Status')).toBeDefined()
  })

  it('renders nothing when hints array is empty', () => {
    const { container } = render(<FooterShortcutHints hints={[]} />)
    expect(container.firstChild).toBeNull()
  })
})
