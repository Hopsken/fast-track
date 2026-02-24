import { HTTPError } from 'ky'
import type { NormalizedOptions } from 'ky'
import { describe, expect, it, vi } from 'vitest'

import type { ExtensionAuth, SubscriptionSnapshot } from '~/types'

function http401(): HTTPError {
  return new HTTPError(
    new Response(null, { status: 401 }),
    new Request('http://test'),
    {} as unknown as NormalizedOptions
  )
}

const fetchMe = vi.hoisted(() => vi.fn())
const refreshAccessToken = vi.hoisted(() => vi.fn())
const getStorageItem = vi.hoisted(() => vi.fn())

vi.mock('~/lib/entitlements/api', () => ({
  fetchMe,
  refreshAccessToken
}))

vi.mock('~/lib/storage', () => ({
  getStorageItem
}))

type StorageMock<T> = {
  getValue: () => Promise<T>
  setValue: (value: T) => Promise<void>
  removeValue: () => Promise<void>
}

describe('syncEntitlementsOnce', () => {
  it('should mark auth as relogin_required when refresh token is rejected (401)', async () => {
    const auth: ExtensionAuth = {
      accessToken: 'access',
      refreshToken: 'refresh',
      user: { id: 'u1', email: 'a@b.com' },
      state: 'active'
    }

    const snapshot: SubscriptionSnapshot = {
      status: 'active',
      renewsAt: null,
      endsAt: null,
      updatedAt: null,
      isPro: true,
      lastCheckedAt: new Date().toISOString()
    }

    const authStorage: StorageMock<ExtensionAuth | null> = {
      getValue: vi.fn(async () => auth),
      setValue: vi.fn(async () => undefined),
      removeValue: vi.fn(async () => undefined)
    }

    const snapshotStorage: StorageMock<SubscriptionSnapshot | null> = {
      getValue: vi.fn(async () => snapshot),
      setValue: vi.fn(async () => undefined),
      removeValue: vi.fn(async () => undefined)
    }

    getStorageItem.mockImplementation((key: string) => {
      if (key === 'ExtensionAuth') return authStorage
      if (key === 'SubscriptionSnapshot') return snapshotStorage
      throw new Error(`unexpected key: ${key}`)
    })

    const { syncEntitlementsOnce } = await import('./sync')

    fetchMe.mockRejectedValueOnce(http401())
    refreshAccessToken.mockRejectedValueOnce(http401())

    const res = await syncEntitlementsOnce()

    expect(res).toBeNull()
    expect(authStorage.setValue).toHaveBeenCalledTimes(1)

    const updated = (
      authStorage.setValue as unknown as { mock: { calls: unknown[][] } }
    ).mock.calls[0]![0] as ExtensionAuth
    expect(updated.state).toBe('relogin_required')
    expect(updated.reloginReason).toBe('refresh_token_rejected')
    expect(updated.user.email).toBe('a@b.com')

    expect(snapshotStorage.removeValue).toHaveBeenCalledTimes(1)
  })
})
