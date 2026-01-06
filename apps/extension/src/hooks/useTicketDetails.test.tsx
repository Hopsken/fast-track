import React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { ticketService } from '@/services'

import { useTicketDetails } from './useTicketDetails'

vi.mock('@/services', () => ({
  ticketService: {
    getTicketDetails: vi.fn()
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
    const mockDetail = { id: '1', key: 'TEST-1', summary: 'Test Issue' }
    vi.mocked(ticketService.getTicketDetails).mockResolvedValue(
      mockDetail as any
    )

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )

    const { result } = renderHook(() => useTicketDetails('TEST-1'), { wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toEqual(mockDetail)
    expect(ticketService.getTicketDetails).toHaveBeenCalledWith('TEST-1')
  })

  it('does not fetch when key is undefined', async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )

    const { result } = renderHook(() => useTicketDetails(undefined), {
      wrapper
    })

    expect(result.current.fetchStatus).toBe('idle')
    expect(ticketService.getTicketDetails).not.toHaveBeenCalled()
  })
})
