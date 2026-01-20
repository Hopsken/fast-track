import React from 'react'
import { Command } from '@internal/ui/components/command'
import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useIssueComments } from '@/hooks/useIssueComments'
import { useTicketDetails } from '@/hooks/useTicketDetails'

import { TicketCommentsMenu } from './TicketCommentsMenu'

vi.mock('@/services', () => ({
  projectService: { recordProjectClick: vi.fn() },
  ticketService: {
    getTicketDetails: vi.fn(),
    getIssueComments: vi.fn()
  },
  jiraService: {},
  authService: {}
}))

vi.mock('@/hooks/useTicketDetails', () => ({
  useTicketDetails: vi.fn()
}))
vi.mock('@/hooks/useIssueComments', () => ({
  useIssueComments: vi.fn()
}))

describe('TicketCommentsMenu', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('renders a list of comments', () => {
    vi.mocked(useTicketDetails).mockReturnValue({
      data: {
        __typename: 'JiraTicket',
        id: '1',
        key: 'T-1',
        summary: 'Test ticket',
        issueType: { name: 'Bug', iconUrl: '', description: '' },
        status: {
          id: '1',
          name: 'To Do',
          description: '',
          statusCategory: { key: 'new', colorName: 'blue-gray', name: 'To Do' }
        },
        assignee: null,
        priority: null,
        projectKey: 'PROJ',
        boardName: 'Board',
        url: 'https://jira.example.com/browse/T-1',
        isInProgress: false,
        sources: [],
        lastViewed: null,
        created: '2026-01-01T00:00:00.000Z',
        updated: '2026-01-02T00:00:00.000Z'
      },
      isLoading: false
    } as any)

    vi.mocked(useIssueComments).mockReturnValue({
      data: [
        {
          id: 'c1',
          author: {
            displayName: 'Alice',
            emailAddress: 'alice@example.com',
            avatarUrls: ''
          },
          created: '2026-01-20T00:00:00.000Z',
          updated: null,
          text: 'First comment'
        }
      ],
      isLoading: false
    } as any)

    render(
      <Command>
        <TicketCommentsMenu ticketKey="T-1" />
      </Command>
    )

    expect(screen.getByText('Alice')).toBeDefined()
    expect(screen.getByText('First comment')).toBeDefined()
  })
})
