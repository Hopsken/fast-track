import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { TicketDescription } from './TicketDescription'

vi.mock('@/utils/jira-images', () => ({
  processHtmlContent: vi
    .fn()
    .mockImplementation((html) => Promise.resolve(html))
}))

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
