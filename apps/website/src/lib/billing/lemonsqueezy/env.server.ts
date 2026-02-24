import 'server-only'

import { requiredEnv } from '../../env/required'

export interface LemonSqueezyEnv {
  webhookSecret: string
}

export interface LemonSqueezyApiEnv {
  apiKey: string
}

export function getLemonSqueezyEnv(): LemonSqueezyEnv {
  return {
    webhookSecret: requiredEnv(
      'LEMONSQUEEZY_WEBHOOK_SECRET',
      process.env.LEMONSQUEEZY_WEBHOOK_SECRET
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
