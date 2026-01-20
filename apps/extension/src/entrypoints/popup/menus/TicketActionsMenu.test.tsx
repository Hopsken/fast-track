import React from 'react'
import { Command } from '@internal/ui/components/command'
import { UseQueryResult } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useCommandNavigate } from '@/components/CommandRouter'
import { useIsOptionKeyPressed } from '@/hooks/useIsOptionKeyPressed'
import { useIssueComments } from '@/hooks/useIssueComments'
import { useIssueEditMeta } from '@/hooks/useIssueEditMeta'
import { useIssueMergeRequests } from '@/hooks/useIssueMergeRequests'
import { useIssuePriorities } from '@/hooks/useIssuePriorities'
import { useIssueTransitions } from '@/hooks/useIssueTransitions'
import { useMutationAssignMyself } from '@/hooks/useMutationAssignIssue'
import { useTicketDetails } from '@/hooks/useTicketDetails'
import { useCurrentUser } from '@/stores/useCurrentUser'
import { useUserPreferences } from '@/stores/useUserPreferences'
import { IssueDetail } from '@/types'

import { TicketActionsMenu } from './TicketActionsMenu'

vi.mock('@/services', () => ({
  projectService: { recordProjectClick: vi.fn() },
  ticketService: {
    getTicketDetails: vi.fn(),
    getIssueMergeRequests: vi.fn(),
    getIssueEditMetadata: vi.fn(),
    getIssueTransitions: vi.fn(),
    getPriorities: vi.fn(),
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
vi.mock('@/hooks/useIsOptionKeyPressed', () => ({
  useIsOptionKeyPressed: vi.fn()
}))
vi.mock('@/hooks/useIssueMergeRequests', () => ({
  useIssueMergeRequests: vi.fn()
}))
vi.mock('@/hooks/useIssuePriorities', () => ({
  useIssuePriorities: vi.fn()
}))
vi.mock('@/hooks/useIssueEditMeta', () => ({
  useIssueEditMeta: vi.fn()
}))
vi.mock('@/hooks/useIssueTransitions', () => ({
  useIssueTransitions: vi.fn()
}))
vi.mock('@/hooks/useMutationAssignIssue', () => ({
  useMutationAssignMyself: vi.fn()
}))
vi.mock('@/stores/useCurrentUser', () => ({
  useCurrentUser: vi.fn()
}))
vi.mock('@/stores/useUserPreferences', () => ({
  useUserPreferences: vi.fn()
}))
vi.mock('@/components/CommandRouter', () => ({
  useCommandNavigate: vi.fn()
}))

describe('TicketActionsMenu', () => {
  beforeEach(() => {
    vi.resetAllMocks()

    vi.mocked(useCommandNavigate).mockReturnValue({
      push: vi.fn(),
      pop: vi.fn()
    } as any)

    vi.mocked(useIsOptionKeyPressed).mockReturnValue(false)

    vi.mocked(useUserPreferences).mockReturnValue([
      {
        branchNameFormat: '{key}-{summary}',
        autoCopyBranchNameOnTransition: false,
        autoAssignOnInProgress: false
      },
      vi.fn()
    ] as any)

    vi.mocked(useCurrentUser).mockReturnValue(null)

    vi.mocked(useMutationAssignMyself).mockReturnValue({
      mutateAsync: vi.fn()
    } as any)

    vi.mocked(useIssueMergeRequests).mockReturnValue({
      data: [],
      isLoading: false
    } as any)

    // Prefetch hooks (called unconditionally)
    vi.mocked(useIssuePriorities).mockReturnValue({} as any)
    vi.mocked(useIssueEditMeta).mockReturnValue({} as any)
    vi.mocked(useIssueTransitions).mockReturnValue({} as any)
    vi.mocked(useIssueComments).mockReturnValue({} as any)
  })

  it('shows a Comments submenu entry', () => {
    const ticket = {
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
    } as unknown as IssueDetail

    vi.mocked(useTicketDetails).mockReturnValue({
      data: ticket,
      isLoading: false
    } as unknown as UseQueryResult<IssueDetail>)

    render(
      <Command>
        <TicketActionsMenu ticketKey={ticket.key} />
      </Command>
    )

    expect(screen.getByText('Comments...')).toBeDefined()
  })
})
