import { createAnalytics } from '@wxt-dev/analytics'
import { useAppConfig } from 'wxt/utils/app-config'

// eslint-disable-next-line react-hooks/rules-of-hooks
export const analytics = createAnalytics(useAppConfig().analytics)
