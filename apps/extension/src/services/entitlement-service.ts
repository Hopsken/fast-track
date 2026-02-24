import { browser } from '#imports'
import { defineProxyService } from '@webext-core/proxy-service'
import { z } from 'zod'

import { BOOST_WEBSITE_BASE_URL } from '~/lib/api'
import { exchangeLinkCode } from '~/lib/entitlements/api'
import { syncEntitlementsOnce } from '~/lib/entitlements/sync'
import { getStorageItem } from '~/lib/storage'
import type { ExtensionAuth, SubscriptionSnapshot } from '~/types'

export interface EntitlementService {
  connect(): Promise<string>
  receiveLinkCode(payload: {
    code: string
    expiresAt: string
    extensionId: string
  }): Promise<SubscriptionSnapshot>
  syncNow(): Promise<SubscriptionSnapshot | null>
  signOut(): Promise<boolean>
  getAuth(): Promise<ExtensionAuth | null>
}

const linkCodePayloadSchema = z.object({
  code: z.string().min(1),
  expiresAt: z.string().min(1),
  extensionId: z.string().min(1)
})

class EntitlementServiceImpl implements EntitlementService {
  private authStorage = getStorageItem('ExtensionAuth')
  private snapshotStorage = getStorageItem('SubscriptionSnapshot')

  public async connect(): Promise<string> {
    const extensionId = browser.runtime.id
    return `${BOOST_WEBSITE_BASE_URL}/auth/extension?extension_id=${encodeURIComponent(
      extensionId
    )}`
  }

  public async getAuth(): Promise<ExtensionAuth | null> {
    return this.authStorage.getValue()
  }

  public async signOut(): Promise<boolean> {
    await Promise.all([
      this.authStorage.removeValue(),
      this.snapshotStorage.removeValue()
    ])
    return true
  }

  public async receiveLinkCode(payload: {
    code: string
    expiresAt: string
    extensionId: string
  }): Promise<SubscriptionSnapshot> {
    const parsed = linkCodePayloadSchema.parse(payload)

    // Belt + suspenders: ensure we only accept codes intended for this extension.
    if (parsed.extensionId !== browser.runtime.id) {
      throw new Error('extension_id_mismatch')
    }

    const res = await exchangeLinkCode({
      code: parsed.code,
      extensionId: parsed.extensionId
    })

    const auth: ExtensionAuth = {
      accessToken: res.accessToken,
      refreshToken: res.refreshToken,
      user: res.user
    }

    await this.authStorage.setValue(auth)

    const now = new Date().toISOString()
    const snapshot: SubscriptionSnapshot = {
      status: res.subscription?.status ?? null,
      renewsAt: res.subscription?.renewsAt ?? null,
      endsAt: res.subscription?.endsAt ?? null,
      updatedAt: res.subscription?.updatedAt ?? null,
      isPro: res.isPro,
      lastCheckedAt: now
    }

    await this.snapshotStorage.setValue(snapshot)

    return snapshot
  }

  public async syncNow(): Promise<SubscriptionSnapshot | null> {
    return syncEntitlementsOnce()
  }
}

export const [registerEntitlementService, getEntitlementService] =
  defineProxyService<EntitlementService, []>('EntitlementService', () => {
    return new EntitlementServiceImpl()
  })
