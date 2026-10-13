import { umami } from '@wxt-dev/analytics/providers/umami'
import { defineAppConfig } from 'wxt/utils/define-app-config'

import { withAnalyticsConsent } from './lib/analytics/data-collection'
import { getStorageItem } from './lib/storage'

export default defineAppConfig({
  analytics: {
    debug: true,
    userId: getStorageItem('DeviceId'),
    enabled: withAnalyticsConsent(getStorageItem('analytics-enabled')),
    providers: [
      umami({
        apiUrl: 'https://cloud.umami.is/api',
        websiteId: import.meta.env.WXT_UMAMI_WEBSITE_ID,
        domain: 'fast-track.work'
      })
    ]
  }
})
