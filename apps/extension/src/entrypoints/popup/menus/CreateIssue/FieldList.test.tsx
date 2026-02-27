import { Command } from '@internal/ui/components/command'
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { FieldList } from './FieldList'

describe('FieldList', () => {
  it('shows a loading state while fields are being fetched', () => {
    const { container } = render(
      <Command>
        <FieldList
          heading="Review"
          fields={[]}
          values={{}}
          errors={{}}
          isLoading
          onSelectField={vi.fn()}
        />
      </Command>
    )

    expect(screen.getByText('Loading fields...')).toBeTruthy()
    expect(container.querySelector('[data-slot="command-list"]')).toBeTruthy()
    expect(screen.queryByText('No fields available for this template')).toBeNull()
  })

  it('shows an explicit empty state when no fields are available', () => {
    render(
      <Command>
        <FieldList
          heading="Review"
          fields={[]}
          values={{}}
          errors={{}}
          onSelectField={vi.fn()}
        />
      </Command>
    )

    expect(
      screen.getByText("You're all set. No additional fields required.")
    ).toBeTruthy()
    expect(screen.queryByText('Loading fields...')).toBeNull()
  })
})
