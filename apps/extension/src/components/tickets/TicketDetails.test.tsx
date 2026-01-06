import React from 'react'
import { Command } from '@internal/ui/components/command'
import { render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useCommandNavigate } from '@/components/CommandRouter'
import { useTicketDetails } from '@/hooks/useTicketDetails'

import { TicketDetails } from './TicketDetails'

vi.mock('@/hooks/useTicketDetails')
vi.mock('@/components/CommandRouter')
vi.mock('@/services', () => ({
  ticketService: {
    getTicketDetails: vi.fn()
  }
}))
vi.mock('@/utils/jira-images', () => ({
  processHtmlContent: vi
    .fn()
    .mockImplementation((html) => Promise.resolve(html))
}))

describe('TicketDetails', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    vi.mocked(useCommandNavigate).mockReturnValue({ pop: vi.fn() } as any)
  })

  it('renders content', async () => {
    vi.mocked(useTicketDetails).mockReturnValue({
      isLoading: false,
      data: {
        summary: 'Ticket Summary',
        key: 'T-1',
        issueType: { name: 'Bug' },
        status: { name: 'Done', statusCategory: { colorName: 'green' } },
        description: '<p>Full Description Content</p>'
      }
    } as any)

    render(
      <Command>
        <TicketDetails issueKey="1" />
      </Command>
    )

    await waitFor(() => {
      expect(screen.getByText('Full Description Content')).toBeDefined()
      expect(screen.getByText('Ticket Summary')).toBeDefined()
    })
  })
})
