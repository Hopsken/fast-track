import { afterEach, describe, expect, it } from 'vitest'

import {
  addReconcileId,
  clearReconcileIds,
  getReconcileIds
} from './reconcile-ids'

afterEach(() => {
  clearReconcileIds()
})

describe('reconcile-ids', () => {
  it('starts empty', () => {
    expect(getReconcileIds()).toEqual([])
  })

  it('adds a single id', () => {
    addReconcileId(123)
    expect(getReconcileIds()).toContain(123)
  })

  it('deduplicates ids', () => {
    addReconcileId(42)
    addReconcileId(42)
    expect(getReconcileIds().filter((id) => id === 42)).toHaveLength(1)
  })

  it('accumulates multiple ids', () => {
    addReconcileId(1)
    addReconcileId(2)
    addReconcileId(3)
    expect(getReconcileIds()).toEqual(expect.arrayContaining([1, 2, 3]))
    expect(getReconcileIds()).toHaveLength(3)
  })

  it('clears all ids', () => {
    addReconcileId(10)
    addReconcileId(20)
    clearReconcileIds()
    expect(getReconcileIds()).toEqual([])
  })
})
