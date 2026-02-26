import { describe, expect, it } from 'vitest'

import { resolveEscapeAction } from './actionSearchEscape'

describe('resolveEscapeAction', () => {
  it('clears search first when editable input has content', () => {
    const action = resolveEscapeAction({
      hasSearchValue: true,
      isRoot: false,
      readonly: false
    })

    expect(action).toBe('clear-search')
  })

  it('closes popup at root when search is empty', () => {
    const action = resolveEscapeAction({
      hasSearchValue: false,
      isRoot: true
    })

    expect(action).toBe('close-popup')
  })

  it('navigates back when not root and search is empty', () => {
    const action = resolveEscapeAction({
      hasSearchValue: false,
      isRoot: false
    })

    expect(action).toBe('navigate-back')
  })

  it('does not clear readonly input and exits instead', () => {
    const action = resolveEscapeAction({
      hasSearchValue: true,
      isRoot: false,
      readonly: true
    })

    expect(action).toBe('navigate-back')
  })
})
