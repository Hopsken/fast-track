function required(name: string, value: string | undefined): string {
  if (!value) throw new Error(`Missing required environment variable: ${name}`)
  return value
}

/**
 * Single-source checkout URL.
 *
 * LemonSqueezy test/live modes use different hosted checkout URLs.
 * We keep code simple and let the deployment environment decide which URL to use.
 *
 * Vercel supports per-environment env vars (Development / Preview / Production),
 * so you can point dev/preview at a test checkout and production at the live checkout.
 */
export function getProCheckoutUrl(): string {
  return required(
    'LEMONSQUEEZY_PRO_CHECKOUT_URL',
    process.env.LEMONSQUEEZY_PRO_CHECKOUT_URL
  )
}
