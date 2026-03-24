import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { SwitchRow } from './SwitchRow'

describe('SwitchRow', () => {
  it('renders title and description', () => {
    render(
      <SwitchRow
        id="test-toggle"
        title="Enable feature"
        description="This enables the feature."
        checked={false}
        onCheckedChange={vi.fn()}
      />
    )

    expect(screen.getByText('Enable feature')).toBeDefined()
    expect(screen.getByText('This enables the feature.')).toBeDefined()
  })

  it('renders switch with the given id', () => {
    render(
      <SwitchRow
        id="my-switch"
        title="Toggle"
        description="Some description"
        checked={false}
        onCheckedChange={vi.fn()}
      />
    )

    const toggle = document.getElementById('my-switch')
    expect(toggle).not.toBeNull()
  })

  it('reflects checked=true via aria-checked', () => {
    render(
      <SwitchRow
        id="my-switch"
        title="Toggle"
        description="Some description"
        checked={true}
        onCheckedChange={vi.fn()}
      />
    )

    const toggle = document.getElementById('my-switch')
    expect(toggle?.getAttribute('aria-checked')).toBe('true')
  })

  it('reflects checked=false via aria-checked', () => {
    render(
      <SwitchRow
        id="my-switch"
        title="Toggle"
        description="Some description"
        checked={false}
        onCheckedChange={vi.fn()}
      />
    )

    const toggle = document.getElementById('my-switch')
    expect(toggle?.getAttribute('aria-checked')).toBe('false')
  })

  it('shows "On" label when checked', () => {
    render(
      <SwitchRow
        id="my-switch"
        title="Toggle"
        description="desc"
        checked={true}
        onCheckedChange={vi.fn()}
      />
    )

    expect(screen.getByText('On')).toBeDefined()
  })

  it('shows "Off" label when unchecked', () => {
    render(
      <SwitchRow
        id="my-switch"
        title="Toggle"
        description="desc"
        checked={false}
        onCheckedChange={vi.fn()}
      />
    )

    expect(screen.getByText('Off')).toBeDefined()
  })

  it('calls onCheckedChange when switch is clicked', () => {
    const onCheckedChange = vi.fn()
    render(
      <SwitchRow
        id="my-switch"
        title="Toggle"
        description="desc"
        checked={false}
        onCheckedChange={onCheckedChange}
      />
    )

    const toggle = document.getElementById('my-switch')!
    fireEvent.click(toggle)

    expect(onCheckedChange).toHaveBeenCalledWith(true)
  })

  it('renders footer when provided', () => {
    render(
      <SwitchRow
        id="my-switch"
        title="Toggle"
        description="desc"
        checked={false}
        onCheckedChange={vi.fn()}
        footer={<p>Extra info</p>}
      />
    )

    expect(screen.getByText('Extra info')).toBeDefined()
  })

  it('does not render footer when omitted', () => {
    render(
      <SwitchRow
        id="my-switch"
        title="Toggle"
        description="desc"
        checked={false}
        onCheckedChange={vi.fn()}
      />
    )

    expect(screen.queryByText('Extra info')).toBeNull()
  })
})
