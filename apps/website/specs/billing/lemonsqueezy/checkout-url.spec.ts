import { describe, expect, it } from 'vitest'

import { buildLemonCheckoutUrl } from '../../../src/lib/billing/lemonsqueezy/checkout-url'

describe('buildLemonCheckoutUrl', () => {
  it('should append custom supabase user id', () => {
    const url = buildLemonCheckoutUrl({
      checkoutUrl: 'https://teamusement.lemonsqueezy.com/checkout/buy/test',
      userId: 'user-123'
    })

    expect(url).toContain('checkout%5Bcustom%5D%5Bsupabase_user_id%5D=user-123')
  })

  it('should prefill email when provided', () => {
    const url = buildLemonCheckoutUrl({
      checkoutUrl: 'https://teamusement.lemonsqueezy.com/checkout/buy/test',
      userId: 'user-123',
      email: 'a@b.com'
    })

    expect(url).toContain('checkout%5Bemail%5D=a%40b.com')
  })
})
