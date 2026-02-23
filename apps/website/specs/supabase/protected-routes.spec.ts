import { describe, expect, it } from 'vitest'

import { isProtectedPath } from '../../src/lib/supabase/protected-routes'

describe('isProtectedPath', () => {
  it('should protect /account', () => {
    expect(isProtectedPath('/account')).toBe(true)
  })

  it('should protect /account/*', () => {
    expect(isProtectedPath('/account/billing')).toBe(true)
  })

  it('should not protect other paths', () => {
    expect(isProtectedPath('/')).toBe(false)
    expect(isProtectedPath('/login')).toBe(false)
    expect(isProtectedPath('/privacy')).toBe(false)
  })

  it('should not protect non-path strings', () => {
    expect(isProtectedPath('account')).toBe(false)
  })
})
