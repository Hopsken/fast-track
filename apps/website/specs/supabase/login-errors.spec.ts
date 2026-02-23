import { describe, expect, it } from 'vitest'

import { formatLoginError } from '../../src/lib/supabase/login-errors'

describe('formatLoginError', () => {
  it('should return null for empty input', () => {
    expect(formatLoginError(undefined)).toBe(null)
    expect(formatLoginError('')).toBe(null)
    expect(formatLoginError('   ')).toBe(null)
  })

  it('should map known codes', () => {
    expect(formatLoginError('exchange_code_for_session_failed')?.title).toBe(
      'Sign-in failed'
    )
  })

  it('should pass through unknown errors', () => {
    expect(formatLoginError('something-went-wrong')).toEqual({
      title: 'Sign-in error',
      description: 'something-went-wrong'
    })
  })
})
