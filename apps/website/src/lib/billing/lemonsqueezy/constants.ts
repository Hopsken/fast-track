type LemonSqueezyMode = 'live' | 'test'

// Public hosted checkout URL (safe to commit).
// Note: test mode uses a *different* checkout URL (different variant/store).
export const LEMONSQUEEZY_PRO_CHECKOUT_URL_LIVE =
  'https://teamusement.lemonsqueezy.com/checkout/buy/07c617f7-c658-40a3-9541-f72e60bcd49b'

function getLemonSqueezyMode(): LemonSqueezyMode {
  const explicit = process.env.LEMONSQUEEZY_MODE
  if (explicit === 'live' || explicit === 'test') return explicit

  // Prefer Vercel env when available. `NODE_ENV` is often "production" even in Preview.
  const vercelEnv = process.env.VERCEL_ENV
  if (vercelEnv === 'production') return 'live'
  if (vercelEnv === 'preview' || vercelEnv === 'development') return 'test'

  return process.env.NODE_ENV === 'production' ? 'live' : 'test'
}

export function getProCheckoutUrl(): string {
  const mode = getLemonSqueezyMode()

  if (mode === 'test') {
    const testUrl = process.env.LEMONSQUEEZY_PRO_CHECKOUT_URL_TEST
    if (!testUrl) {
      throw new Error(
        'Missing required environment variable: LEMONSQUEEZY_PRO_CHECKOUT_URL_TEST'
      )
    }
    return testUrl
  }

  // Live mode: allow env override, otherwise fallback to committed URL.
  return (
    process.env.LEMONSQUEEZY_PRO_CHECKOUT_URL_LIVE ??
    LEMONSQUEEZY_PRO_CHECKOUT_URL_LIVE
  )
}
