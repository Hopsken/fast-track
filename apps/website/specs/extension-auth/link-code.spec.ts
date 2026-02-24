import { describe, expect, it } from 'vitest'

import { hashLinkCode } from '../../src/lib/extension-auth/link-code'

describe('hashLinkCode', () => {
  it('should return sha256 hex', () => {
    // sha256('hello')
    expect(hashLinkCode('hello')).toBe(
      '2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824'
    )
  })
})
