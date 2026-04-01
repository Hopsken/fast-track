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

  it('serves stale cached data when Jira returns empty and retries exhaust', async () => {
    // Step 1: establish a successful fetch with good data
    vi.mocked(getSuggestionService).mockReturnValue({
      getIssueSuggestions: vi.fn().mockResolvedValue(goodResult)
    } as unknown as ReturnType<typeof getSuggestionService>)

    const { result } = renderHook(() => useIssueSuggestions(), {
      wrapper: makeWrapper(queryClient)
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    // Step 2: Jira now returns empty — simulate post-mutation reconciliation lag
    vi.mocked(getSuggestionService).mockReturnValue({
      getIssueSuggestions: vi.fn().mockResolvedValue(emptyResult)
    } as unknown as ReturnType<typeof getSuggestionService>)

    vi.useFakeTimers()
    queryClient.invalidateQueries({ queryKey: queryKeys.tickets.suggestions })

    // Advance past all retryDelays so the query exhausts retries and enters error state
    await vi.runAllTimersAsync()
    vi.useRealTimers()

    // Query is in error state — retries ran and Jira kept returning empty
    await waitFor(() => expect(result.current.isError).toBe(true))
    // But data is surfaced from the internal cache (last successful fetch) — no blank list
    expect(result.current.data).toEqual(goodResult)
  })

  it('structuralSharing guard blocks empty data from overwriting good cache state', async () => {
    // This guard catches edge cases where queryFn returns empty without throwing
    // (e.g. cache hydration race, or a future code path). structuralSharing only
    // runs with an active observer — so we mount the hook first.
    vi.mocked(getSuggestionService).mockReturnValue({
      getIssueSuggestions: vi.fn().mockResolvedValue(goodResult)
    } as unknown as ReturnType<typeof getSuggestionService>)

    const { result } = renderHook(() => useIssueSuggestions(), {
      wrapper: makeWrapper(queryClient)
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(goodResult)

    // Force an empty result into the cache while the hook is observing —
    // structuralSharing should reject it and preserve the good data
    queryClient.setQueryData(queryKeys.tickets.suggestions, emptyResult)

    expect(queryClient.getQueryData(queryKeys.tickets.suggestions)).toEqual(
      goodResult
    )
    expect(result.current.data).toEqual(goodResult)
  })
})
