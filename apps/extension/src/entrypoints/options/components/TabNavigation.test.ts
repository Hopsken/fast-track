import { describe, expect, it } from 'vitest'

import { tabs } from './TabNavigation'

describe('TabNavigation', () => {
  it('includes workflow tab and removes templates tab', () => {
    const ids = tabs.map((t) => t.id)

    expect(ids).toContain('workflow')
    expect(ids).not.toContain('templates')
  })
})
