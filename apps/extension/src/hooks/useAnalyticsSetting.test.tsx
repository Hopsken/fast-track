import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
  hasAnalyticsConsent,
  requestAnalyticsConsent,
  revokeAnalyticsConsent
} from '@/lib/analytics/data-collection'

import { useAnalyticsSetting } from './useAnalyticsSetting'
import { useStorage } from './useStorage'

vi.mock('@/lib/analytics/data-collection', () => ({
  hasAnalyticsConsent: vi.fn(),
  requestAnalyticsConsent: vi.fn(),
  revokeAnalyticsConsent: vi.fn()
}))

vi.mock('./useStorage', () => ({ useStorage: vi.fn() }))

describe('useAnalyticsSetting', () => {
  const setStored = vi.fn()

  const mockStored = (value: boolean) => {
    vi.mocked(useStorage).mockReturnValue([value, setStored, 'success'])
  }

  beforeEach(() => {
    vi.resetAllMocks()
    vi.mocked(revokeAnalyticsConsent).mockResolvedValue(undefined)
  })

  it('is on when the setting is on and consent is granted', async () => {
    mockStored(true)
    vi.mocked(hasAnalyticsConsent).mockResolvedValue(true)

    const { result } = renderHook(() => useAnalyticsSetting())

    await waitFor(() => expect(result.current[0]).toBe(true))
  })

  it('is off when consent was declined, even if the setting is on', async () => {
    mockStored(true)
    vi.mocked(hasAnalyticsConsent).mockResolvedValue(false)

    const { result } = renderHook(() => useAnalyticsSetting())

    await waitFor(() => expect(hasAnalyticsConsent).toHaveBeenCalled())
    expect(result.current[0]).toBe(false)
  })

  it('enables only after consent is granted', async () => {
    mockStored(false)
    vi.mocked(hasAnalyticsConsent).mockResolvedValue(false)
    vi.mocked(requestAnalyticsConsent).mockResolvedValue(true)

    const { result } = renderHook(() => useAnalyticsSetting())
    await act(async () => result.current[1](true))

    expect(requestAnalyticsConsent).toHaveBeenCalled()
    expect(setStored).toHaveBeenCalledWith(true)
  })

  it('stays off when consent is denied', async () => {
    mockStored(false)
    vi.mocked(hasAnalyticsConsent).mockResolvedValue(false)
    vi.mocked(requestAnalyticsConsent).mockResolvedValue(false)

    const { result } = renderHook(() => useAnalyticsSetting())
    await act(async () => result.current[1](true))

    expect(setStored).not.toHaveBeenCalled()
  })

  it('disables the setting and revokes consent', async () => {
    mockStored(true)
    vi.mocked(hasAnalyticsConsent).mockResolvedValue(true)

    const { result } = renderHook(() => useAnalyticsSetting())
    await act(async () => result.current[1](false))

    expect(setStored).toHaveBeenCalledWith(false)
    expect(revokeAnalyticsConsent).toHaveBeenCalled()
  })
})
