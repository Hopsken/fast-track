import { browser } from '#imports'

import { syncEntitlementsOnce } from '~/lib/entitlements/sync'
import { getStorageItem } from '~/lib/storage'
import { getLogger } from '~/utils/logger'

const log = getLogger('subscription-sync')

const ALARM_NAME = 'ft-subscription-sync'

// Keep background activity low.
// Token refresh is already handled lazily (401 → refresh), so we only need to
// periodically re-check entitlements for subscription changes.
const PERIOD_MINUTES = 6 * 60
const MIN_RESYNC_MS = 6 * 60 * 60 * 1000

function shouldSync(
  snapshot: {
    lastCheckedAt: string
  } | null
): boolean {
  if (!snapshot?.lastCheckedAt) return true

  const lastCheckedAtMs = Date.parse(snapshot.lastCheckedAt)
  if (Number.isNaN(lastCheckedAtMs)) return true

  return Date.now() - lastCheckedAtMs > MIN_RESYNC_MS
}

export class SubscriptionSyncService {
  static initialize() {
    browser.alarms.create(ALARM_NAME, {
      periodInMinutes: PERIOD_MINUTES
    })

    browser.alarms.onAlarm.addListener(async (alarm) => {
      if (alarm.name !== ALARM_NAME) return

      try {
        const auth = await getStorageItem('ExtensionAuth').getValue()
        if (!auth) return

        const snapshot = await getStorageItem('SubscriptionSnapshot').getValue()
        if (!shouldSync(snapshot)) return

        await syncEntitlementsOnce()
      } catch (error) {
        log.warn('sync failed', error)
      }
    })

    // Best effort initial sync (only if stale).
    void (async () => {
      try {
        const auth = await getStorageItem('ExtensionAuth').getValue()
        if (!auth) return

        const snapshot = await getStorageItem('SubscriptionSnapshot').getValue()
        if (!shouldSync(snapshot)) return

        await syncEntitlementsOnce()
      } catch {
        // ignore
      }
    })()

    log.info('initialized', {
      periodInMinutes: PERIOD_MINUTES,
      minResyncHours: MIN_RESYNC_MS / (60 * 60 * 1000)
    })
  }
}
