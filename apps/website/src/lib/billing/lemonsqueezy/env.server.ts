import 'server-only'

export interface LemonSqueezyEnv {
  webhookSecret: string
}

export interface LemonSqueezyApiEnv {
  apiKey: string
}

function required(name: string, value: string | undefined): string {
  if (!value) throw new Error(`Missing required environment variable: ${name}`)
  return value
}

export function getLemonSqueezyEnv(): LemonSqueezyEnv {
  return {
    webhookSecret: required(
      'LEMONSQUEEZY_WEBHOOK_SECRET',
      process.env.LEMONSQUEEZY_WEBHOOK_SECRET
    )
  }
}

export function getLemonSqueezyApiEnv(): LemonSqueezyApiEnv {
  return {
    apiKey: required('LEMONSQUEEZY_API_KEY', process.env.LEMONSQUEEZY_API_KEY)
  }
}
