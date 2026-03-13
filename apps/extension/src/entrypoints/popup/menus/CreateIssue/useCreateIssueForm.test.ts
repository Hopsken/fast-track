import { act, renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { queryKeys } from '@/utils/queryKeys'

import { useCreateIssueForm } from './useCreateIssueForm'

const mockUseNavigation = vi.fn()
const mockUseCreateIssueDraftStore = vi.fn()
const mockCreateIssue = vi.fn()
const mockInvalidateQueries = vi.fn()
const mockUseMutation = vi.fn()
const mockBuildCreateIssueFields = vi.fn()

vi.mock('@tanstack/react-query', () => ({
  useQueryClient: () => ({
    invalidateQueries: mockInvalidateQueries
  }),
  useMutation: (options: unknown) => mockUseMutation(options)
}))

vi.mock('ahooks', () => ({
  useMemoizedFn: (fn: unknown) => fn
}))

vi.mock('@/common/commands', () => ({
  useNavigation: () => mockUseNavigation()
}))

vi.mock('@/services/jira-service', () => ({
  getJiraService: () => ({
    issues: {
      createIssue: (...args: unknown[]) => mockCreateIssue(...args)
    }
  })
}))

vi.mock('@/stores/command/useToastStore', () => ({
  showToast: () => ({
    update: vi.fn()
  })
}))

vi.mock('./useCreateIssueDraftStore', () => ({
  useCreateIssueDraftStore: () => mockUseCreateIssueDraftStore()
}))

vi.mock('./utils', () => ({
  buildCreateIssueFields: (...args: unknown[]) =>
    mockBuildCreateIssueFields(...args),
  extractJiraFieldErrors: vi.fn()
}))

describe('useCreateIssueForm', () => {
  it('invalidates ticket suggestion query after creating issue', async () => {
    const pop = vi.fn()
    const reset = vi.fn()

    mockUseNavigation.mockReturnValue({ pop })
    mockCreateIssue.mockResolvedValue({ key: 'ABC-123' })
    mockBuildCreateIssueFields.mockReturnValue({})
    mockUseCreateIssueDraftStore.mockReturnValue({
      values: { summary: 'Issue summary' },
      wizardFields: [
        {
          fieldId: 'summary',
          required: true
        }
      ],
      setErrors: vi.fn(),
      promoteFields: vi.fn(),
      reset
    })

    mockUseMutation.mockImplementation(
      (options: {
        mutationFn: (variables: unknown) => Promise<unknown>
        onSuccess?: (data: unknown) => Promise<void> | void
      }) => ({
        mutateAsync: async (variables: unknown) => {
          const result = await options.mutationFn(variables)
          await options.onSuccess?.(result)
          return result
        }
      })
    )

    const { result } = renderHook(() =>
      useCreateIssueForm({
        scope: {
          project: { key: 'ABC' },
          issueType: { id: '10001' }
        } as unknown as Parameters<typeof useCreateIssueForm>[0]['scope']
      })
    )

    await act(async () => {
      await result.current.submit()
    })

    expect(mockInvalidateQueries).toHaveBeenCalledWith({
      queryKey: queryKeys.tickets.suggestions,
      type: 'all'
    })
  })
})
