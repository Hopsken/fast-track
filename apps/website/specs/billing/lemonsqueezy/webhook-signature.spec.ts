import crypto from 'node:crypto'

import { describe, expect, it } from 'vitest'

import { verifyLemonSqueezyWebhookSignature } from '../../../src/lib/billing/lemonsqueezy/webhook-signature'

describe('verifyLemonSqueezyWebhookSignature', () => {
  it('should verify HMAC-SHA256 hex signature', () => {
    const rawBody = '{"hello":"world"}'
    const secret = 'topsecret'

    const signature = crypto
      .createHmac('sha256', secret)
      .update(rawBody, 'utf8')
      .digest('hex')

    expect(
      verifyLemonSqueezyWebhookSignature({ rawBody, signature, secret })
    ).toBe(true)
  })

  it('should return false for invalid signature', () => {
    expect(
      verifyLemonSqueezyWebhookSignature({
        rawBody: 'x',
        signature: 'deadbeef',
        secret: 'y'
      })
    ).toBe(false)
  })

  it('should accept sha256= prefix', () => {
    const rawBody = 'payload'
    const secret = 's'

    const signature =
      'sha256=' +
      crypto.createHmac('sha256', secret).update(rawBody, 'utf8').digest('hex')

    expect(
      verifyLemonSqueezyWebhookSignature({ rawBody, signature, secret })
    ).toBe(true)
  })
})
