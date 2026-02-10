import { describe, it, expect, beforeEach, afterEach } from 'vitest'

import { hotkeyPriorityManager } from './priority-manager'
import type { HotkeyScope } from './types'

describe('HotkeyPriorityManager', () => {
  // Track instance IDs for cleanup
  let instanceIds: string[]

  beforeEach(() => {
    instanceIds = []
  })

  afterEach(() => {
    // Clean up all registered instances
    for (const id of instanceIds) {
      hotkeyPriorityManager.unregister(id)
    }
  })

  function register(
    hotkeyId: string,
    normalizedKeys: string,
    priority: number,
    scopes: HotkeyScope[],
    enabled = true
  ): string {
    const id = hotkeyPriorityManager.register({
      hotkeyId,
      normalizedKeys,
      priority,
      scopes,
      enabled
    })
    instanceIds.push(id)
    return id
  }

  describe('shouldExecute', () => {
    it('higher priority wins when both active', () => {
      const low = register('global.escape', 'escape', 5, ['global'])
      const high = register('field-input.escape', 'escape', 10, ['field-input'])

      // Both scopes active: only high priority should execute
      const activeScopes = ['global', 'field-input']
      expect(hotkeyPriorityManager.shouldExecute(high, activeScopes)).toBe(true)
      expect(hotkeyPriorityManager.shouldExecute(low, activeScopes)).toBe(false)
    })

    it('scope filtering: inactive scope does not compete', () => {
      const global = register('global.escape', 'escape', 5, ['global'])
      register('field-input.escape', 'escape', 10, ['field-input'])

      // Only global scope active: field-input hotkey doesn't compete
      const activeScopes = ['global']
      expect(hotkeyPriorityManager.shouldExecute(global, activeScopes)).toBe(
        true
      )
    })

    it('unregister removes from competition', () => {
      const low = register('global.escape', 'escape', 5, ['global'])
      const high = register('field-input.escape', 'escape', 10, ['field-input'])

      const activeScopes = ['global', 'field-input']

      // High exists — low should not execute
      expect(hotkeyPriorityManager.shouldExecute(low, activeScopes)).toBe(false)

      // Unregister high — low should now execute
      hotkeyPriorityManager.unregister(high)
      instanceIds = instanceIds.filter((id) => id !== high)
      expect(hotkeyPriorityManager.shouldExecute(low, activeScopes)).toBe(true)
    })

    it('different keys do not interfere', () => {
      const escape = register('global.escape', 'escape', 5, ['global'])
      const enter = register('field.confirm-simple', 'enter', 5, [
        'field-input'
      ])

      const activeScopes = ['global', 'field-input']
      // Different keys — both should execute independently
      expect(hotkeyPriorityManager.shouldExecute(escape, activeScopes)).toBe(
        true
      )
      expect(hotkeyPriorityManager.shouldExecute(enter, activeScopes)).toBe(
        true
      )
    })

    it('equal priority: both execute', () => {
      const a = register('hotkey-a', 'meta+k', 5, ['global'])
      const b = register('hotkey-b', 'meta+k', 5, ['global'])

      const activeScopes = ['global']
      expect(hotkeyPriorityManager.shouldExecute(a, activeScopes)).toBe(true)
      expect(hotkeyPriorityManager.shouldExecute(b, activeScopes)).toBe(true)
    })

    it('returns false for unknown instance', () => {
      expect(
        hotkeyPriorityManager.shouldExecute('nonexistent', ['global'])
      ).toBe(false)
    })

    it('returns false when instance has no active scope', () => {
      const id = register('global.escape', 'escape', 5, ['global'])

      // No matching active scope
      expect(hotkeyPriorityManager.shouldExecute(id, ['field-input'])).toBe(
        false
      )
    })

    it('real scenario: Cmd+Enter with field-input and create-issue scopes', () => {
      const fieldConfirm = register('field.confirm-complex', 'meta+enter', 6, [
        'field-input'
      ])
      const createProceed = register('issue.create.proceed', 'meta+enter', 4, [
        'create-issue'
      ])

      // Both scopes active (field input within create issue flow)
      const activeScopes = ['create-issue', 'field-input']
      expect(
        hotkeyPriorityManager.shouldExecute(fieldConfirm, activeScopes)
      ).toBe(true)
      expect(
        hotkeyPriorityManager.shouldExecute(createProceed, activeScopes)
      ).toBe(false)
    })
  })
})
