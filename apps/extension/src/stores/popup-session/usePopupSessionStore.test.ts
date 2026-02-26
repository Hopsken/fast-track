import { beforeEach, describe, expect, it } from 'vitest'

import { usePopupSessionStore } from './usePopupSessionStore'

describe('usePopupSessionStore', () => {
  beforeEach(() => {
    usePopupSessionStore.getState().clearAllInputValues()
  })

  it('stores input values by key', () => {
    usePopupSessionStore.getState().setInputValue('main-menu', 'abc')

    expect(usePopupSessionStore.getState().inputValues['main-menu']).toBe('abc')
  })

  it('clears one key without affecting others', () => {
    usePopupSessionStore.getState().setInputValue('main-menu', 'abc')
    usePopupSessionStore.getState().setInputValue('issue-assign:TST-1', 'sam')

    usePopupSessionStore.getState().clearInputValue('main-menu')

    expect(
      usePopupSessionStore.getState().inputValues['main-menu']
    ).toBeUndefined()
    expect(
      usePopupSessionStore.getState().inputValues['issue-assign:TST-1']
    ).toBe('sam')
  })
})
