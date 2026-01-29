import React from 'react'
import { Command } from '@internal/ui/components/command'
import { UseQueryResult } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useCommandNavigate } from '@/components/CommandRouter'
import { useTicketDetails } from '@/hooks/useTicketDetails'
import { IssueDetail, JiraTicket } from '@/types'

import { TicketDetails } from './TicketDetails'

vi.mock('@/hooks/useTicketDetails')
vi.mock('@/components/CommandRouter')
vi.mock('@/services', () => ({
  ticketService: {
    getTicketDetails: vi.fn()
  }
}))

describe('TicketDetails', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    vi.mocked(useCommandNavigate).mockReturnValue({
      pop: vi.fn(),
      push: vi.fn()
    })
  })

  it('renders content', async () => {
    const mockTicket = {
      summary: 'Ticket Summary',
      key: 'T-1',
      issueType: { name: 'Bug' },
      status: { name: 'Done', statusCategory: { colorName: 'green' } }
    } as unknown as JiraTicket

    vi.mocked(useTicketDetails).mockReturnValue({
      isLoading: false,
      data: {
        ...mockTicket,
        description: '<p>Full Description Content</p>'
      }
    } as unknown as UseQueryResult<IssueDetail>)

    render(
      <Command>
        <TicketDetails ticketKey={mockTicket.key} />
      </Command>
    )

    await waitFor(() => {
      expect(screen.getByText('Full Description Content')).toBeDefined()
      expect(screen.getByText('Ticket Summary')).toBeDefined()
    })
  })
})
