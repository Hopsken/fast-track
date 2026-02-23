import { parseLemonSqueezyUrl } from './url'

export function buildLemonCheckoutUrl(options: {
  checkoutUrl: string
  userId: string
  email?: string | null
}): string {
  const url = parseLemonSqueezyUrl(options.checkoutUrl)

  // Prefill email if provided.
  if (options.email) {
    url.searchParams.set('checkout[email]', options.email)
  }

  // Attach user id to the order/subscription so the webhook can map back.
  // LemonSqueezy supports nested `checkout[custom][...]` style params.
  url.searchParams.set('checkout[custom][supabase_user_id]', options.userId)

  return url.toString()
}
