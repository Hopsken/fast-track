import { describe, expect, it } from 'vitest'

import { buildAuthCallbackUrl } from '../../src/lib/supabase/redirect-url'

describe('buildAuthCallbackUrl', () => {
  it('should append /auth/callback', () => {
    expect(buildAuthCallbackUrl('http://localhost:4000')).toBe(
      'http://localhost:4000/auth/callback'
    )
  })

  it('should handle trailing slash', () => {
    expect(buildAuthCallbackUrl('http://localhost:4000/')).toBe(
      'http://localhost:4000/auth/callback'
    )
  })
})
