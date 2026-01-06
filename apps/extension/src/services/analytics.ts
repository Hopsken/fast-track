import { createAnalytics } from '@wxt-dev/analytics'
import { useAppConfig } from 'wxt/utils/app-config'

// eslint-disable-next-line react-hooks/rules-of-hooks
const analytics = createAnalytics(useAppConfig().analytics)

export const trackEvent = (
  name: string,
  properties?: Record<string, string>
) => {
  Promise.resolve().then(() => {
    analytics.track(name, properties)
  })
}
