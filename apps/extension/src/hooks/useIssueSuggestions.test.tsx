import React from 'react'
import { QueryNormalizerProvider } from '@normy/react-query'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { getSuggestionService } from '@/services'
import type { IssueSuggestion } from '@/services/suggestion-service'
import { queryKeys } from '@/utils/queryKeys'

import { useIssueSuggestions } from './useIssueSuggestions'

vi.mock('@/services', () => ({
  getSuggestionService: vi.fn().mockReturnValue({
    getIssueSuggestions: vi.fn()
  })
}))

vi.mock('@/utils/reconcile-ids', () => ({
  getReconcileIds: vi.fn().mockReturnValue([]),
  clearReconcileIds: vi.fn()
}))

const emptyResult: IssueSuggestion = {
  tickets: {},
  inProgress: [],
  todo: [],
  done: [],
  recommend: []
}

const goodResult: IssueSuggestion = {
  tickets: {
    'PROJ-1': {
      __typename: 'JiraIssue',
      id: '1',
      key: 'PROJ-1',
      summary: 'Do the thing',
      issueType: { id: '1', name: 'Task', iconUrl: '', description: '' },
      status: {
        id: 's1',
        name: 'In Progress',
        description: '',
        statusCategory: { key: 'indeterminate', colorName: '', name: '' }
      },
      assignee: null,
      priority: null,
      projectKey: 'PROJ',
      boardName: '',
      url: '',
      isInProgress: true,
      sources: [],
      lastViewed: null,
      created: '',
      updated: ''
    }
  },
  inProgress: ['PROJ-1'],
  todo: [],
  done: [],
  recommend: []
}

function makeWrapper(client: QueryClient) {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryNormalizerProvider queryClient={client}>
        <QueryClientProvider client={client}>{children}</QueryClientProvider>
      </QueryNormalizerProvider>
    )
  }
}

describe('useIssueSuggestions', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } }
    })
    vi.clearAllMocks()
  })

  it('returns data when Jira responds with tickets', async () => {
    vi.mocked(getSuggestionService).mockReturnValue({
      getIssueSuggestions: vi.fn().mockResolvedValue(goodResult)
    } as unknown as ReturnType<typeof getSuggestionService>)

    const { result } = renderHook(() => useIssueSuggestions(), {
      wrapper: makeWrapper(queryClient)
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(goodResult)
  })

  it('throws on empty response when cache is cold (cold-start path)', async () => {
    vi.useFakeTimers()

    vi.mocked(getSuggestionService).mockReturnValue({
      getIssueSuggestions: vi.fn().mockResolvedValue(emptyResult)
    } as unknown as ReturnType<typeof getSuggestionService>)

    const { result } = renderHook(() => useIssueSuggestions(), {
      wrapper: makeWrapper(queryClient)
    })

    // Advance past all retryDelays so the query exhausts retries and errors
    await vi.runAllTimersAsync()
    vi.useRealTimers()

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(result.current.error).toBeInstanceOf(Error)
  })

  it('returns cached data when Jira returns empty but cache has good data', async () => {
    // Pre-seed the cache with good data
    queryClient.setQueryData(queryKeys.tickets.suggestions, goodResult)

    vi.mocked(getSuggestionService).mockReturnValue({
      getIssueSuggestions: vi.fn().mockResolvedValue(emptyResult)
    } as unknown as ReturnType<typeof getSuggestionService>)

    const { result } = renderHook(() => useIssueSuggestions(), {
      wrapper: makeWrapper(queryClient)
    })

    // Should succeed and serve the cached good data — never show empty
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(goodResult)
  })

  it('does not replace good cached data with empty via structuralSharing', async () => {
    // First fetch: good data
    vi.mocked(getSuggestionService).mockReturnValue({
      getIssueSuggestions: vi.fn().mockResolvedValue(goodResult)
    } as unknown as ReturnType<typeof getSuggestionService>)

    const { result, rerender } = renderHook(() => useIssueSuggestions(), {
      wrapper: makeWrapper(queryClient)
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(goodResult)

    // Second fetch: Jira returns empty — structuralSharing should preserve good data
    vi.mocked(getSuggestionService).mockReturnValue({
      getIssueSuggestions: vi.fn().mockResolvedValue(emptyResult)
    } as unknown as ReturnType<typeof getSuggestionService>)

    // Invalidate to trigger a fresh fetch
    queryClient.invalidateQueries({ queryKey: queryKeys.tickets.suggestions })
    rerender()

    // Data must not degrade to empty
    await waitFor(() => expect(result.current.isFetching).toBe(false))
    expect(result.current.data).toEqual(goodResult)
  })
})
