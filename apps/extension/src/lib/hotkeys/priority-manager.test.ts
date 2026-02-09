import { describe, it, expect, beforeEach, afterEach } from 'vitest'

import { hotkeyPriorityManager } from './priority-manager'

describe('HotkeyPriorityManager', () => {
  let instanceIds: string[]

  beforeEach(() => {
    instanceIds = []
  })

  afterEach(() => {
    for (const id of instanceIds) {
      hotkeyPriorityManager.unregister(id)
    }
  })

  function register(
    hotkeyId: string,
    normalizedKeys: string,
    priority: number,
    enabled = true
  ): string {
    const id = hotkeyPriorityManager.register({
      hotkeyId,
      normalizedKeys,
      priority,
      enabled
    })
    instanceIds.push(id)
    return id
  }

  describe('shouldExecute', () => {
    it('higher priority wins when both registered', () => {
      const low = register('global.escape', 'escape', 5)
      const high = register('field-input.escape', 'escape', 10)

      expect(hotkeyPriorityManager.shouldExecute(high)).toBe(true)
      expect(hotkeyPriorityManager.shouldExecute(low)).toBe(false)
    })

    it('dynamic enable/disable', () => {
      const low = register('global.escape', 'escape', 5)
      const high = register('field-input.escape', 'escape', 10)

      expect(hotkeyPriorityManager.shouldExecute(low)).toBe(false)

      hotkeyPriorityManager.updateEnabled(high, false)
      expect(hotkeyPriorityManager.shouldExecute(low)).toBe(true)

      hotkeyPriorityManager.updateEnabled(high, true)
      expect(hotkeyPriorityManager.shouldExecute(low)).toBe(false)
    })

    it('unregister removes from competition', () => {
      const low = register('global.escape', 'escape', 5)
      const high = register('field-input.escape', 'escape', 10)

      expect(hotkeyPriorityManager.shouldExecute(low)).toBe(false)

      hotkeyPriorityManager.unregister(high)
      instanceIds = instanceIds.filter((id) => id !== high)
      expect(hotkeyPriorityManager.shouldExecute(low)).toBe(true)
    })

    it('different keys do not interfere', () => {
      const escape = register('global.escape', 'escape', 5)
      const enter = register('field.confirm-simple', 'enter', 10)

      expect(hotkeyPriorityManager.shouldExecute(escape)).toBe(true)
      expect(hotkeyPriorityManager.shouldExecute(enter)).toBe(true)
    })

    it('equal priority: both execute', () => {
      const a = register('hotkey-a', 'meta+k', 5)
      const b = register('hotkey-b', 'meta+k', 5)

      expect(hotkeyPriorityManager.shouldExecute(a)).toBe(true)
      expect(hotkeyPriorityManager.shouldExecute(b)).toBe(true)
    })

    it('returns false for unknown instance', () => {
      expect(hotkeyPriorityManager.shouldExecute('nonexistent')).toBe(false)
    })

    it('real scenario: Cmd+Enter with field-input and create-issue', () => {
      const fieldConfirm = register('field.confirm-complex', 'meta+enter', 6)
      const createProceed = register('issue.create.proceed', 'meta+enter', 4)

      expect(hotkeyPriorityManager.shouldExecute(fieldConfirm)).toBe(true)
      expect(hotkeyPriorityManager.shouldExecute(createProceed)).toBe(false)
    })
  })
})
