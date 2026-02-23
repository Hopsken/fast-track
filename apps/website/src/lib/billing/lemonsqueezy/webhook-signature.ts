import crypto from 'node:crypto'

export function getWebhookSignature(headers: Headers): string | null {
  return (
    headers.get('x-signature') ??
    headers.get('x-lemonsqueezy-signature') ??
    headers.get('x-lemon-squeezy-signature')
  )
}

function normalizeSignature(signature: string): string {
  return signature.startsWith('sha256=')
    ? signature.slice('sha256='.length)
    : signature
}

/**
 * Verifies LemonSqueezy webhook signature.
 *
 * LemonSqueezy signs the raw request body using HMAC-SHA256.
 */
export function verifyLemonSqueezyWebhookSignature(options: {
  rawBody: string
  signature: string
  secret: string
}): boolean {
  const expected = crypto
    .createHmac('sha256', options.secret)
    .update(options.rawBody, 'utf8')
    .digest('hex')

  const actual = normalizeSignature(options.signature)

  const expectedBuf = Buffer.from(expected, 'hex')
  const actualBuf = Buffer.from(actual, 'hex')

  if (expectedBuf.length !== actualBuf.length) return false

  return crypto.timingSafeEqual(expectedBuf, actualBuf)
}
