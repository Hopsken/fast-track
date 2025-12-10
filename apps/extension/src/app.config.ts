import { storage } from '#imports'
import { umami } from '@wxt-dev/analytics/providers/umami'
import { defineAppConfig } from 'wxt/utils/define-app-config'

import { getStorageItem } from './lib/storage'

export default defineAppConfig({
  analytics: {
    debug: true,
    userId: storage.defineItem<string>('local:user-analytics-id', {
      fallback: 'anonymous',
      init: () => crypto.randomUUID()
    }),
    enabled: getStorageItem('analytics-enabled'),
    providers: [
      umami({
        apiUrl: 'https://cloud.umami.is/api',
        websiteId: import.meta.env.WXT_UMAMI_WEBSITE_ID,
        domain: 'teamusement.com'
      })
    ]
  }
})
