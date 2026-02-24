import { HTTPError } from 'ky'

import { getStorageItem } from '~/lib/storage'
import type { SubscriptionSnapshot, ExtensionAuth } from '~/types'

import { fetchMe, refreshAccessToken } from './api'

function toSnapshot(input: {
  subscription: {
    status: string
    renewsAt: string | null
    endsAt: string | null
    updatedAt: string
  } | null
  isPro: boolean
  checkedAt: string
}): SubscriptionSnapshot {
  return {
    status: input.subscription?.status ?? null,
    renewsAt: input.subscription?.renewsAt ?? null,
    endsAt: input.subscription?.endsAt ?? null,
    updatedAt: input.subscription?.updatedAt ?? null,
    isPro: input.isPro,
    lastCheckedAt: input.checkedAt
  }
}

export async function syncEntitlementsOnce(): Promise<SubscriptionSnapshot | null> {
  const authStorage = getStorageItem('ExtensionAuth')
  const snapshotStorage = getStorageItem('SubscriptionSnapshot')

  const auth = await authStorage.getValue()
  if (!auth) return null
  if (auth.state === 'relogin_required') return null

  try {
    const me = await fetchMe({ accessToken: auth.accessToken })
    const snapshot = toSnapshot({
      subscription: me.subscription,
      isPro: me.isPro,
      checkedAt: me.checkedAt
    })
    await snapshotStorage.setValue(snapshot)
    return snapshot
  } catch (error) {
    if (error instanceof HTTPError && error.response.status === 401) {
      try {
        const refreshed = await refreshAccessToken({
          refreshToken: auth.refreshToken
        })

        const updatedAuth: ExtensionAuth = {
          ...auth,
          accessToken: refreshed.accessToken
        }
        await authStorage.setValue(updatedAuth)

        const me = await fetchMe({ accessToken: refreshed.accessToken })
        const snapshot = toSnapshot({
          subscription: me.subscription,
          isPro: me.isPro,
          checkedAt: me.checkedAt
        })
        await snapshotStorage.setValue(snapshot)
        return snapshot
      } catch (refreshError) {
        // If refresh is rejected (expired/revoked), force a clean sign-in state
        // instead of showing stale entitlements forever.
        if (
          refreshError instanceof HTTPError &&
          refreshError.response.status === 401
        ) {
          const updatedAuth: ExtensionAuth = {
            ...auth,
            state: 'relogin_required',
            reloginReason: 'refresh_token_rejected',
            reloginAt: new Date().toISOString()
          }

          await Promise.all([
            authStorage.setValue(updatedAuth),
            // Fail-safe: treat entitlements as unknown until the user signs in again.
            snapshotStorage.removeValue()
          ])

          return null
        }

        throw refreshError
      }
    }

    throw error
  }
}
