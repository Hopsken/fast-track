import React from 'react'
import { Command } from '@internal/ui/components/command'
import { render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useCommandNavigate } from '@/components/CommandRouter'
import { useTicketDetails } from '@/hooks/useTicketDetails'

import { TicketDescriptionFull } from './TicketDescriptionFull'

vi.mock('@/hooks/useTicketDetails')
vi.mock('@/components/CommandRouter')
vi.mock('@/utils/jira-images', () => ({
  processHtmlContent: vi
    .fn()
    .mockImplementation((html) => Promise.resolve(html))
}))

describe('TicketDescriptionFull', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    vi.mocked(useCommandNavigate).mockReturnValue({ pop: vi.fn() } as any)
  })

  it('renders content', async () => {
    vi.mocked(useTicketDetails).mockReturnValue({
      isLoading: false,
      data: { description: '<p>Full Content</p>' }
    } as any)

    render(
      <Command>
        <TicketDescriptionFull issueKey="1" />
      </Command>
    )

    await waitFor(() => {
      expect(screen.getByText('Full Content')).toBeDefined()
    })
  })
})
