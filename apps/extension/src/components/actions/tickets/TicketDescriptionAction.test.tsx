import React from 'react'
import { Command } from '@internal/ui/components/command'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { TicketDescriptionAction } from './TicketDescriptionAction'

describe('TicketDescriptionAction', () => {
  it('renders content', () => {
    render(
      <Command>
        <TicketDescriptionAction html="<p>Content</p>" onSelect={() => {}} />
      </Command>
    )
    expect(screen.getByText('Content')).toBeDefined()
  })
})
