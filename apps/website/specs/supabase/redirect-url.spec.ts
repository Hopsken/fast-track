import { describe, expect, it } from 'vitest'

import {
  buildAuthCallbackUrl,
  sanitizeNextPath
} from '../../src/lib/supabase/redirect-url'

describe('sanitizeNextPath', () => {
  it('should allow relative paths', () => {
    expect(sanitizeNextPath('/account')).toBe('/account')
    expect(sanitizeNextPath('/auth/extension?x=1')).toBe('/auth/extension?x=1')
  })

  it('should reject empty and external values', () => {
    expect(sanitizeNextPath(undefined)).toBe(null)
    expect(sanitizeNextPath('')).toBe(null)
    expect(sanitizeNextPath('  ')).toBe(null)
    expect(sanitizeNextPath('https://evil.com')).toBe(null)
    expect(sanitizeNextPath('//evil.com')).toBe(null)
    expect(sanitizeNextPath('account')).toBe(null)
  })
})

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

  it('should include next query param when safe', () => {
    expect(buildAuthCallbackUrl('http://localhost:4000', '/account')).toBe(
      'http://localhost:4000/auth/callback?next=%2Faccount'
    )
  })
})
