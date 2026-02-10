import type { RegisterHotkeyOptions } from './types'

export type { RegisterHotkeyOptions } from './types'

interface RegisteredHotkey extends RegisterHotkeyOptions {
  instanceId: string
}

let nextId = 0

/**
 * Module-level singleton that tracks all mounted useHotkey instances.
 * At invocation time, determines whether a given instance has the highest
 * priority among all active instances sharing the same key combo.
 */
class HotkeyPriorityManager {
  private instances = new Map<string, RegisteredHotkey>()

  register(options: RegisterHotkeyOptions): string {
    const instanceId = `hotkey-${nextId++}`
    this.instances.set(instanceId, { instanceId, ...options })
    return instanceId
  }

  unregister(instanceId: string): void {
    this.instances.delete(instanceId)
  }

  /**
   * Returns true if this instance should execute its callback.
   * Checks all other registered instances with the same normalizedKeys
   * that have at least one scope in activeScopes and are enabled.
   * If any has strictly higher priority, returns false.
   * Equal priority → both execute (preserves current behavior).
   */
  shouldExecute(instanceId: string, activeScopes: string[]): boolean {
    const instance = this.instances.get(instanceId)
    if (!instance) return false

    const activeScopesSet = new Set(activeScopes)

    // Check if this instance itself has an active scope
    const instanceHasActiveScope = instance.scopes.some((s) =>
      activeScopesSet.has(s)
    )
    if (!instanceHasActiveScope) return false

    for (const other of this.instances.values()) {
      if (other.instanceId === instanceId) continue
      if (other.normalizedKeys !== instance.normalizedKeys) continue

      // Check if the other instance has at least one active scope
      const otherHasActiveScope = other.scopes.some((s) =>
        activeScopesSet.has(s)
      )
      if (!otherHasActiveScope) continue

      if (other.priority > instance.priority) {
        return false
      }
    }

    return true
  }
}

export const hotkeyPriorityManager = new HotkeyPriorityManager()
