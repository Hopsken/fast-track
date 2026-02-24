import { browser } from '#imports'

import { syncEntitlementsOnce } from '~/lib/entitlements/sync'
import { getStorageItem } from '~/lib/storage'
import { getLogger } from '~/utils/logger'

const log = getLogger('subscription-sync')

const ALARM_NAME = 'ft-subscription-sync'
const PERIOD_MINUTES = 20

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

        await syncEntitlementsOnce()
      } catch (error) {
        log.warn('sync failed', error)
      }
    })

    // Best effort initial sync.
    void (async () => {
      try {
        const auth = await getStorageItem('ExtensionAuth').getValue()
        if (!auth) return
        await syncEntitlementsOnce()
      } catch {
        // ignore
      }
    })()

    log.info('initialized', { periodInMinutes: PERIOD_MINUTES })
  }
}
