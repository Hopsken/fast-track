import { describe, expect, it, vi } from 'vitest'

const post = vi.hoisted(() =>
  vi.fn(() => ({ json: vi.fn(async () => ({ ok: true })) }))
)
const get = vi.hoisted(() =>
  vi.fn(() => ({ json: vi.fn(async () => ({ ok: true })) }))
)

vi.mock('~/lib/api', () => ({
  boostApi: {
    post,
    get
  }
}))

import { exchangeLinkCode, fetchMe } from './api'

describe('entitlements api', () => {
  it('exchangeLinkCode should call token endpoint', async () => {
    await exchangeLinkCode({ code: 'c', extensionId: 'ext' })

    expect(post).toHaveBeenCalledWith('api/extension/token', {
      json: { code: 'c', extensionId: 'ext' }
    })
  })

  it('fetchMe should send bearer token', async () => {
    await fetchMe({ accessToken: 't' })

    expect(get).toHaveBeenCalledWith('api/extension/me', {
      headers: { Authorization: 'Bearer t' }
    })
  })
})
