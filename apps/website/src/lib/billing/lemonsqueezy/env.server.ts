import 'server-only'

import { requiredEnv } from '../../env/required'

export interface LemonSqueezyEnv {
  webhookSecret: string
  proCheckoutUrl: string
}

export interface LemonSqueezyApiEnv {
  apiKey: string
}

export function getLemonSqueezyEnv(): LemonSqueezyEnv {
  return {
    webhookSecret: requiredEnv(
      'LEMONSQUEEZY_WEBHOOK_SECRET',
      process.env.LEMONSQUEEZY_WEBHOOK_SECRET
    ),
    proCheckoutUrl: requiredEnv(
      'LEMONSQUEEZY_PRO_CHECKOUT_URL',
      process.env.LEMONSQUEEZY_PRO_CHECKOUT_URL
    )
  }
}

export function getLemonSqueezyApiEnv(): LemonSqueezyApiEnv {
  return {
    apiKey: requiredEnv(
      'LEMONSQUEEZY_API_KEY',
      process.env.LEMONSQUEEZY_API_KEY
    )
  }
}
