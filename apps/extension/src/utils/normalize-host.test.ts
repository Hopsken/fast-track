import { describe, expect, it } from 'vitest'

import { normalizeBaseUrlHost } from './normalize-host'

describe('normalizeBaseUrlHost', () => {
  it('returns hostname for a full URL', () => {
    expect(normalizeBaseUrlHost('https://ExAmple.atlassian.net')).toBe(
      'example.atlassian.net'
    )
  })

  it('returns hostname for a host-only input', () => {
    expect(normalizeBaseUrlHost('Example.atlassian.net')).toBe(
      'example.atlassian.net'
    )
  })

  it('returns hostname for a URL with path', () => {
    expect(
      normalizeBaseUrlHost('https://example.atlassian.net/browse/PROJ')
    ).toBe('example.atlassian.net')
  })

  it('returns empty string for invalid input', () => {
    expect(normalizeBaseUrlHost('not a url')).toBe('')
  })
})
