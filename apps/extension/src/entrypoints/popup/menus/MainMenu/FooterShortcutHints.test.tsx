import { render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { FooterShortcutHints, ShortcutHint } from './FooterShortcutHints'

const hints: ShortcutHint[] = [
  { keys: ['/'], label: 'Commands' },
  { keys: ['C'], label: 'New Issue' },
  { keys: ['⌘', '⇧', 'S'], label: 'Status' }
]

describe('FooterShortcutHints', () => {
  beforeEach(() => {
    // Pin Math.random so initial index is deterministic (index 0)
    vi.spyOn(Math, 'random').mockReturnValue(0)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders the hint selected on mount', () => {
    render(<FooterShortcutHints hints={hints} />)

    expect(screen.getByText('/')).toBeDefined()
    expect(screen.getByText('Commands')).toBeDefined()
  })

  it('renders exactly one hint even when multiple provided', () => {
    render(<FooterShortcutHints hints={hints} />)

    // Only the first hint's label should appear (random pinned to 0)
    expect(screen.getByText('Commands')).toBeDefined()
    expect(screen.queryByText('New Issue')).toBeNull()
    expect(screen.queryByText('Status')).toBeNull()
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
