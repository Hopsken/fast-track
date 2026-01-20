import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { TicketDescription } from './TicketDescription'

describe('TicketDescription', () => {
  it('renders content', async () => {
    const html = '<p>Description Content</p>'
    render(<TicketDescription html={html} />)

    await waitFor(() => {
      expect(screen.getByText('Description Content')).toBeDefined()
    })
  })

  it('renders fallback when empty', () => {
    render(<TicketDescription html="" />)
    expect(screen.getByText('No description provided.')).toBeDefined()
  })
})
