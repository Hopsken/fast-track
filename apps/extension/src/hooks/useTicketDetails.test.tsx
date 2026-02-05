import React from 'react'
import { QueryNormalizerProvider } from '@normy/react-query'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { getJiraService } from '@/services'
import { JiraTicket } from '@/types'

import { useTicketDetails } from './useTicketDetails'

vi.mock('@/services', () => ({
  getJiraService: {
    issues: {
      getIssueDetail: vi.fn()
    }
  }
}))

describe('useTicketDetails', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false
        }
      }
    })
    vi.resetAllMocks()
  })

  it('fetches ticket details successfully', async () => {
    const mockDetail = {
      id: '1',
      key: 'TEST-1',
      summary: 'Test Issue'
    } as unknown as JiraTicket
    vi.mocked(getJiraService().issues.getIssueDetail).mockResolvedValue(
      mockDetail
    )

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryNormalizerProvider queryClient={queryClient}>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </QueryNormalizerProvider>
    )

    const { result } = renderHook(() => useTicketDetails(mockDetail.key), {
      wrapper
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toEqual(mockDetail)
    expect(getJiraService().issues.getIssueDetail).toHaveBeenCalledWith(
      'TEST-1'
    )
  })
})
