// @vitest-environment node

import { describe, expect, it } from 'vitest'

import {
  createExtensionAccessToken,
  createExtensionRefreshToken,
  verifyExtensionAccessToken,
  verifyExtensionRefreshToken
} from '../../src/lib/extension-auth/jwt'

const secret = 'test-secret-test-secret-test-secret'

describe('extension-auth jwt', () => {
  it('should sign + verify access token', async () => {
    const token = await createExtensionAccessToken({
      secret,
      userId: 'user-123',
      now: new Date('2026-02-23T00:00:00Z')
    })

    const payload = await verifyExtensionAccessToken({
      secret,
      token,
      now: new Date('2026-02-23T00:00:30Z')
    })

    expect(payload.userId).toBe('user-123')
  })

  it('should not accept refresh token as access token', async () => {
    const token = await createExtensionRefreshToken({
      secret,
      userId: 'user-123',
      now: new Date('2026-02-23T00:00:00Z')
    })

    await expect(
      verifyExtensionAccessToken({
        secret,
        token,
        now: new Date('2026-02-23T00:00:30Z')
      })
    ).rejects.toThrow(/token_type/i)
  })

  it('should reject expired access token', async () => {
    const token = await createExtensionAccessToken({
      secret,
      userId: 'user-123',
      now: new Date('2026-02-23T00:00:00Z')
    })

    await expect(
      verifyExtensionAccessToken({
        secret,
        token,
        now: new Date('2026-02-24T00:00:01Z')
      })
    ).rejects.toThrow(/exp.*failed/i)
  })

  it('should sign + verify refresh token', async () => {
    const token = await createExtensionRefreshToken({
      secret,
      userId: 'user-123',
      now: new Date('2026-02-23T00:00:00Z')
    })

    const payload = await verifyExtensionRefreshToken({
      secret,
      token,
      now: new Date('2026-02-23T00:00:30Z')
    })

    expect(payload.userId).toBe('user-123')
  })
})
