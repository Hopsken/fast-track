import React from 'react'
import { Command } from '@internal/ui/components/command'
import { UseQueryResult } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useTicketDetails } from '@/hooks/useTicketDetails'
import { JiraIssueDetail, JiraIssue } from '@/types'

import { TicketDetails } from './TicketDetails'

vi.mock('@/hooks/useTicketDetails')
vi.mock('@/components/CommandRouter')
vi.mock('@/services', () => ({
  getJiraService: {
    issues: {
      getTicketDetails: vi.fn()
    }
  }
}))

describe('TicketDetails', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('renders content', async () => {
    const mockTicket = {
      summary: 'Ticket Summary',
      key: 'T-1',
      issueType: { name: 'Bug' },
      status: { name: 'Done', statusCategory: { colorName: 'green' } }
    } as unknown as JiraIssue

    vi.mocked(useTicketDetails).mockReturnValue({
      isLoading: false,
      data: {
        ...mockTicket,
        description: '<p>Full Description Content</p>'
      }
    } as unknown as UseQueryResult<JiraIssueDetail>)

    render(
      <MemoryRouter>
        <Command>
          <TicketDetails ticketKey={mockTicket.key} />
        </Command>
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('Full Description Content')).toBeDefined()
      expect(screen.getByText('Ticket Summary')).toBeDefined()
    })
  })
})
