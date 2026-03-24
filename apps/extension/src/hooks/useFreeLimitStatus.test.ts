import { renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { useCurrentJiraHost } from './useCurrentJiraHost'
import { useFreeLimitStatus } from './useFreeLimitStatus'
import { useStorage } from './useStorage'
import { useTemplates } from './useTemplates'

vi.mock('./useCurrentJiraHost', () => ({
  useCurrentJiraHost: vi.fn()
}))
vi.mock('./useStorage', () => ({
  useStorage: vi.fn()
}))
vi.mock('./useTemplates', () => ({
  useTemplates: vi.fn()
}))

const HOST = 'test.atlassian.net'

function makeTemplate(host: string, id: string) {
  return {
    id,
    scope: { baseUrlHost: host }
  }
}

function setup({
  host = HOST,
  templates = [],
  snapshotState = 'success' as 'pending' | 'success' | 'error',
  isPro = false
}: {
  host?: string | null
  templates?: ReturnType<typeof makeTemplate>[]
  snapshotState?: 'pending' | 'success' | 'error'
  isPro?: boolean
} = {}) {
  vi.mocked(useCurrentJiraHost).mockReturnValue({
    data: host,
    isLoading: false
  })
  vi.mocked(useTemplates).mockReturnValue({
    data: templates as never,
    isLoading: false
  } as never)
  vi.mocked(useStorage).mockReturnValue([
    snapshotState === 'success' ? { isPro } : undefined,
    vi.fn(),
    snapshotState
  ] as never)
}

describe('useFreeLimitStatus', () => {
  it('returns isPro: null while snapshot is loading', () => {
    setup({ snapshotState: 'pending' })
    const { result } = renderHook(() => useFreeLimitStatus())
    expect(result.current.isPro).toBeNull()
    expect(result.current.isAtFreeLimit).toBe(false)
  })

  it('returns isPro: true when snapshot says pro', () => {
    setup({ isPro: true })
    const { result } = renderHook(() => useFreeLimitStatus())
    expect(result.current.isPro).toBe(true)
    expect(result.current.isAtFreeLimit).toBe(false)
  })

  it('returns isPro: false and isAtFreeLimit: false when under limit', () => {
    setup({
      isPro: false,
      templates: [makeTemplate(HOST, '1'), makeTemplate(HOST, '2')]
    })
    const { result } = renderHook(() => useFreeLimitStatus())
    expect(result.current.isPro).toBe(false)
    expect(result.current.isAtFreeLimit).toBe(false)
    expect(result.current.templateCount).toBe(2)
  })

  it('returns isAtFreeLimit: true when non-pro and >= 3 templates on current host', () => {
    setup({
      isPro: false,
      templates: [
        makeTemplate(HOST, '1'),
        makeTemplate(HOST, '2'),
        makeTemplate(HOST, '3')
      ]
    })
    const { result } = renderHook(() => useFreeLimitStatus())
    expect(result.current.isAtFreeLimit).toBe(true)
    expect(result.current.templateCount).toBe(3)
  })

  it('does not count templates on other hosts toward the limit', () => {
    setup({
      isPro: false,
      templates: [
        makeTemplate(HOST, '1'),
        makeTemplate(HOST, '2'),
        // These are on a different host and must NOT count
        makeTemplate('other.atlassian.net', '3'),
        makeTemplate('other.atlassian.net', '4'),
        makeTemplate('other.atlassian.net', '5')
      ]
    })
    const { result } = renderHook(() => useFreeLimitStatus())
    expect(result.current.templateCount).toBe(2)
    expect(result.current.isAtFreeLimit).toBe(false)
  })

  it('returns isAtFreeLimit: false when pro even with many templates', () => {
    setup({
      isPro: true,
      templates: [
        makeTemplate(HOST, '1'),
        makeTemplate(HOST, '2'),
        makeTemplate(HOST, '3'),
        makeTemplate(HOST, '4')
      ]
    })
    const { result } = renderHook(() => useFreeLimitStatus())
    expect(result.current.isAtFreeLimit).toBe(false)
  })
})
