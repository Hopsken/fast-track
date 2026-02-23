import { describe, expect, it } from 'vitest'

import { hasSupabaseAuthCookies } from '../../src/lib/supabase/auth-cookies'

describe('hasSupabaseAuthCookies', () => {
  it('should return true when an sb-* cookie exists', () => {
    expect(
      hasSupabaseAuthCookies([
        { name: 'sb-project-auth-token' },
        { name: 'other' }
      ])
    ).toBe(true)
  })

  it('should return false when no sb-* cookies exist', () => {
    expect(hasSupabaseAuthCookies([{ name: 'foo' }])).toBe(false)
  })
})
