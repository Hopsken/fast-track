import { describe, expect, it, vi } from 'vitest'

import { isProFromSubscription } from '../../src/lib/billing/subscription'

describe('isProFromSubscription', () => {
  it('should be pro when active', () => {
    expect(isProFromSubscription({ status: 'active' })).toBe(true)
  })

  it('should be pro when cancelled but endsAt is in the future', () => {
    vi.setSystemTime(new Date('2026-01-01T00:00:00Z'))

    expect(
      isProFromSubscription({
        status: 'cancelled',
        endsAt: '2026-02-01T00:00:00Z'
      })
    ).toBe(true)

    vi.useRealTimers()
  })

  it('should not be pro when cancelled and endsAt is in the past', () => {
    vi.setSystemTime(new Date('2026-03-01T00:00:00Z'))

    expect(
      isProFromSubscription({
        status: 'cancelled',
        endsAt: '2026-02-01T00:00:00Z'
      })
    ).toBe(false)

    vi.useRealTimers()
  })
})
