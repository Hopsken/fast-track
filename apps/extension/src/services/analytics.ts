import { createAnalytics } from '@wxt-dev/analytics'
import { getAppConfig } from 'wxt/utils/app-config'

const analytics = createAnalytics(getAppConfig().analytics)

export const trackEvent = (
  name: string,
  properties?: Record<string, string>
) => {
  Promise.resolve().then(() => {
    analytics.track(name, properties)
  })
}
