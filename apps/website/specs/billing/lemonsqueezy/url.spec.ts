import { describe, expect, it } from 'vitest'

import {
  isAllowedLemonSqueezyUrl,
  parseLemonSqueezyUrl
} from '../../../src/lib/billing/lemonsqueezy/url'

describe('lemonsqueezy url validation', () => {
  it('accepts https lemonsqueezy subdomains', () => {
    expect(
      isAllowedLemonSqueezyUrl(
        'https://teamusement.lemonsqueezy.com/checkout/buy/abc'
      )
    ).toBe(true)
  })

  it('rejects non-https', () => {
    expect(
      isAllowedLemonSqueezyUrl('http://teamusement.lemonsqueezy.com/x')
    ).toBe(false)
  })

  it('rejects non-lemonsqueezy hosts', () => {
    expect(isAllowedLemonSqueezyUrl('https://example.com')).toBe(false)
    expect(
      isAllowedLemonSqueezyUrl('https://lemonsqueezy.com.evil.com')
    ).toBe(false)
  })

  it('rejects credentials in url', () => {
    expect(
      isAllowedLemonSqueezyUrl('https://user:pass@lemonsqueezy.com/path')
    ).toBe(false)
  })

  it('parse throws on invalid', () => {
    expect(() => parseLemonSqueezyUrl('https://example.com')).toThrow()
  })
})
