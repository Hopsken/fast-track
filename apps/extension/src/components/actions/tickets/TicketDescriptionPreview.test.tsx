import React from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { TicketDescriptionPreview } from './TicketDescriptionPreview'

describe('TicketDescriptionPreview', () => {
  it('renders nothing if no html', () => {
    const { container } = render(<TicketDescriptionPreview html="" />)
    expect(container.firstChild).toBeNull()
  })

  it('renders text content', () => {
    const html = '<p>Hello <strong>World</strong></p>'
    render(<TicketDescriptionPreview html={html} />)
    expect(screen.getByText('Hello World')).toBeDefined()
  })
})
